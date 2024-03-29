import { Request, Response, NextFunction } from "express";
import Category from "../../models/Category";
import CustomError from "../../utils/error";
import CustomErrorMessage from "../../utils/errorMessage";

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await Category.find();

    res.status(200).json({
      message: "Fetch categories successfully!",
      categories,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch categories!", 422);
      return next(customError);
    }
  }
};

export const getCategoriesSelect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await Category.find({
      isDeleted: false
    });

      const resSelect = categories.map((item) => {
        return {
          label: item.name,
          value: item._id.toString()
        }
      })

    res.status(200).json(resSelect);
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch categories!", 422);
      return next(customError);
    }
  }
};

export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  const { categoryId } = req.params;
  try {
    const category = await Category.findById(categoryId);

    if (!category) {
      const error = new CustomError("Category", "Category not found", 404);
      throw error;
    }

    res.status(200).json({
      message: "Fetch category by id successfully!",
      category,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch category by id!", 422);
      return next(customError);
    }
  }
};
