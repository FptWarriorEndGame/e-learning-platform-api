import { Request, Response, NextFunction } from "express";
import Wishlist from "../../models/Wishlist";
import CustomError from "../../utils/error";
import CustomErrorMessage from "../../utils/errorMessage";

export const createWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId, userId } = req.body;

    if (!courseId || !userId) {
      const error = new CustomError("Invalid Request", "Course ID and User ID are required.", 400);
      throw error;
    }

    const existingWishlist = await Wishlist.findOne({ userId, courseId });

    if (existingWishlist) {
      if (existingWishlist.isDeleted) {
        existingWishlist.isDeleted = false;
        const updatedWishlist = await existingWishlist.save();

        res.status(200).json({
          message: "Wishlist item already exists and has been restored",
          data: updatedWishlist,
        });
      } else {
        const error = new CustomError("Duplicate", "This course is already in your wishlist.", 400);
        throw error;
      }
    } else {
      const wishlist = new Wishlist({
        userId,
        courseId,
      });

      const savedWishlist = await wishlist.save();

      res.status(201).json({
        message: "Wishlist created successfully",
        data: savedWishlist,
      });
    }
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to created wishlist!", 422);
      return next(customError);
    }
  }
};

export const deleteWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;
    const { userId } = req.body;

    if (!courseId || !userId) {
      const error = new CustomError("Invalid Request", "Course ID and User ID are required.", 400);
      throw error;
    }

    const wishlist = await Wishlist.findOne({ userId, courseId, isDeleted: false });

    if (!wishlist) {
      const error = new CustomError("Not Found", "Wishlist item not found.", 404);
      throw error;
    }

    wishlist.isDeleted = true;
    await wishlist.save();

    res.status(200).json({
      message: "Wishlist item marked as deleted successfully",
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to delete wishlist item", 422);
      return next(customError);
    }
  }
};
