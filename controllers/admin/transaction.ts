import { Request, Response, NextFunction } from "express";
import Order from "../../models/Order";
import CustomError from "../../utils/error";
import CustomErrorMessage from "../../utils/errorMessage";

export const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const searchTerm = (req.query._q as string) || "";
    const page = parseInt(req.query._page as string) || 1;
    const limit = parseInt(req.query._limit as string) || 10;
    const skip = (page - 1) * limit;

    const query = {
      status: "Success",
      totalPrice: { $gt: 0 },
      ...(searchTerm ? { "user.name": { $regex: searchTerm, $options: "i" } } : {}),
    };

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .select("transaction _id user")
      .skip(skip)
      .limit(limit)
      .populate("user", "name email");

    const transactions = orders.map((order) => ({
      orderId: order._id,
      user: order.user,
      transaction: order.transaction,
    }));

    res.status(200).json({
      message: "Fetch transactions successfully!",
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
      transactions,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch transactions!", 422);
      return next(customError);
    }
  }
};
