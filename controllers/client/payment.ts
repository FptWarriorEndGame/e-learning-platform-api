import { Request, Response, NextFunction } from "express";
import { FRONTEND_URL } from "../../config/frontend-domain";
import CustomError from "../../utils/error";
import CustomErrorMessage from "../../utils/errorMessage";
import Coupon from "../../models/Coupon";
import moment from "moment";
import querystring from "qs";
import crypto from "crypto";
import Order from "../../models/Order";
import vnpaymentConfig from "../../config/vnpayment_config.json";

interface VnpParams {
  [key: string]: string | number;
}

export const createVnpayUrl = async (req: Request, res: Response, next: NextFunction) => {
  process.env.TZ = "Asia/Ho_Chi_Minh";

  try {
    let date = new Date();
    let createDate = moment(date).format("YYYYMMDDHHmmss");

    let ipAddr = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

    let tmnCode = vnpaymentConfig.vnp_TmnCode;
    let secretKey = vnpaymentConfig.vnp_HashSecret;
    let vnpUrl = vnpaymentConfig.vnp_Url;
    let returnUrl = vnpaymentConfig.vnp_ReturnUrl;
    let orderId = req.body.orderId;
    let amount = req.body.amount;
    let bankCode = req.body.bankCode;

    let locale = req.body.language || "vn";
    let currCode = "VND";
    let vnp_Params: VnpParams = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Locale: locale,
      vnp_CurrCode: currCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: "Thanh toan cho ma GD:" + orderId,
      vnp_OrderType: "other",
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    if (bankCode) {
      vnp_Params["vnp_BankCode"] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

    res.json({ redirectUrl: vnpUrl });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage(
        "An unexpected error occurred while creating the payment URL.",
        422
      );
      return next(customError);
    }
  }
};

export const handleVnpayReturn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let vnp_Params: VnpParams = Object.entries(req.query).reduce((acc, [key, value]) => {
      acc[key] = Array.isArray(value) ? value.join(",") : value.toString();
      return acc;
    }, {} as VnpParams);

    let secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);

    let secretKey = vnpaymentConfig.vnp_HashSecret;

    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      const orderId = vnp_Params["vnp_TxnRef"];
      const transactionStatus = vnp_Params["vnp_TransactionStatus"];
      const vnp_AmountVND: number = Number(vnp_Params["vnp_Amount"]);
      const vnp_PayDate = vnp_Params["vnp_PayDate"] as string;

      const payDate = new Date(
        `${vnp_PayDate.slice(0, 4)}-${vnp_PayDate.slice(4, 6)}-${vnp_PayDate.slice(
          6,
          8
        )}T${vnp_PayDate.slice(8, 10)}:${vnp_PayDate.slice(10, 12)}:${vnp_PayDate.slice(
          12,
          14
        )}.000Z`
      );

      const vnp_AmountUSD: number = vnp_AmountVND / 100 / 23000;

      if (transactionStatus === "00") {
        const updatedOrder = await Order.findOneAndUpdate(
          { _id: orderId },
          {
            status: "Success",
            transaction: {
              method: "VN Pay",
              amount: vnp_AmountUSD,
              bankCode: vnp_Params["vnp_BankCode"],
              bankTranNo: vnp_Params["vnp_BankTranNo"],
              cardType: vnp_Params["vnp_CardType"],
              payDate: payDate,
              orderInfo: vnp_Params["vnp_OrderInfo"],
              transactionNo: vnp_Params["vnp_TransactionNo"],
            },
          },
          { new: true }
        );

        if (updatedOrder) {
          const { couponCode, user } = updatedOrder;

          if (couponCode !== null) {
            const coupon = await Coupon.findOne({ code: couponCode });
            if (coupon) {
              coupon.usedBy.push(user._id);
              await coupon.save();
            }
          }

          res.redirect(`${FRONTEND_URL}/order-completed?orderId=${orderId}`);
        } else {
          res.send("Error: Order not found");
        }
      } else {
        const canceledOrder = await Order.findOneAndUpdate(
          { _id: orderId },
          { status: "Cancelled" },
          { new: true }
        );
        if (canceledOrder) {
          res.send("Payment Failed. The order has been cancelled.");
        } else {
          res.send("Error: Order not found");
        }
      }
    } else {
      res.send("Error: Invalid secure hash");
    }
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage(
        "An unexpected error occurred while processing the VNPay payment response.",
        500
      );
      return next(customError);
    }
  }
};

const sortObject = (obj: VnpParams): VnpParams => {
  let sorted: VnpParams = {};
  let str: string[] = [];
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (let key of str) {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
  }
  return sorted;
};
