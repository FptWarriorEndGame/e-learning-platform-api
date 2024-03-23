import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import User from "../models/User";
import Course from "../models/Course";
import CustomError from "../utils/error";
import CustomErrorMessage from "../utils/errorMessage";
import { enumData } from "../config/enumData";

export interface OwnerAuthRequest extends Request {
  userId?: string;
  courseId?: string;
  decodedToken?: string | JwtPayload;
}

export default async (req: OwnerAuthRequest, res: Response, next: NextFunction) => {
  const { courseId } = req.params;

  try {
    const user = await User.findById(req.userId);

    const isAdmin = user.role === enumData.UserType.Admin.code;

    const currentCourse = await Course.findById(courseId);

    const isOwnerOfCourse = currentCourse.userId.toString() === req.userId;

    if (!isAdmin && !isOwnerOfCourse) {
      const error = new CustomError(
        "Role",
        "This user is not admin role! and not the owner of this course",
        401
      );
      throw error;
    }

    next();
  } catch (error) {
    if (error instanceof CustomError) {
      return error;
    } else {
      const customError = new CustomErrorMessage("Failed to authorize user with admin role!", 422);
      next(customError);
    }
  }
};
