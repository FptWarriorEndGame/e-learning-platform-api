import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { IUser } from "../types/user.type";
import CustomError from "../utils/error";
import CustomErrorMessage from "../utils/errorMessage";
import { enumData } from "../config/enumData";

interface AdminAuthRequest extends Request {
  userId?: string;
}

export default async (req: AdminAuthRequest, res: Response, next: NextFunction) => {
  try {
    const user: IUser | null = await User.findById(req.userId);
    const isAdmin: boolean = user?.role === enumData.UserType.Admin.code || user?.role === enumData.UserType.Author.code;

    if (!isAdmin) {
      const error = new CustomError("Admin", "This user is not admin or author role!", 401);
      throw error;
    }

    next();
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to authorize user with admin role!", 422);
      return next(customError);
    }
  }
};
