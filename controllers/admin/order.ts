import { Request, Response, NextFunction } from "express";
import Order from "../../models/Order";
import CustomError from "../../utils/error";
import CustomErrorMessage from "../../utils/errorMessage";

interface GetOrdersQuery {
  "items._id"?: string;
  createdAt?: {
    $gte: Date;
    $lte: Date;
  };
  $text?: {
    $search: string;
  };
}

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  const { courseId, date, searchText } = req.query;

  const currentDate = new Date();

  let previousDays = -1;

  switch (date) {
    case "all":
      previousDays = -1;
      break;
    case "today":
      previousDays = 0;
      break;
    case "yesterday":
      previousDays = 1;
      break;
    case "7days":
      previousDays = 7;
      break;
    case "30days":
      previousDays = 30;
      break;

    default:
      break;
  }
  const previousDaysAgo = new Date(currentDate);
  previousDaysAgo.setDate(previousDaysAgo.getDate() - previousDays);

  try {
    const orderQuery: GetOrdersQuery = {
      
    };

    if (courseId && typeof courseId === "string" && courseId !== "all") {
      orderQuery["items._id"] = courseId;
    }

    if (previousDays !== -1) {
      previousDaysAgo.setHours(0, 0, 0, 0);

      orderQuery.createdAt = {
        $gte: previousDaysAgo,
        $lte: currentDate,
      };
    }

    if (searchText && typeof searchText === "string") {
      orderQuery.$text = {
        $search: searchText,
      };
    }

    const orders = await Order.find(orderQuery).populate("user._id", "_id name avatar email phone").sort({ createdAt: -1 } );

    const result = orders.map((orderItem) => {
      return {
        _id: orderItem._id,
        transaction: orderItem.transaction,
        totalPrice: orderItem.totalPrice,
        items: orderItem.items,
        note: orderItem.note,
        user: orderItem.user._id,
        vatFee: orderItem.vatFee,
        createdAt: orderItem.createdAt,
        updatedAt: orderItem.updatedAt,
      };
    });

    res.json({
      message: "fetch all orders successfully!",
      orders: result,
      count: orders.length,
      total: orders.reduce((acc, order) => acc + order.totalPrice, 0),
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch orders!", 422);
      return next(customError);
    }
  }
};

export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      const error = new CustomError("Order", "Order not found", 404);
      throw error;
    }

    res.status(200).json({
      message: "Get order by id successfully!",
      order,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to get order by id!", 422);
      return next(customError);
    }
  }
};