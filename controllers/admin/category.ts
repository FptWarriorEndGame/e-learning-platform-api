import { Request, Response, NextFunction } from "express";
import Category from "../../models/Category";
import { ICategory } from "../../types/category.type";
import Course from "../../models/Course";
import { body, validationResult } from "express-validator";
import CustomError from "../../utils/error";
import CustomErrorMessage from "../../utils/errorMessage";
import { AuthorAuthRequest } from "../../middleware/is-auth";
import mongoose, { ClientSession } from "mongoose";
import { enumData } from "../../config/enumData";
import ActionLog from "../../models/ActionLog";

interface GetCategoriesQuery {
  $text?: { $search: string };
  name?: string;
  createdBy?: string;
}

export const getCategories = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const { _q, _cateName } = req.query;

  const query: GetCategoriesQuery = {};
  const currentUserRole = req.role;
  if (currentUserRole && currentUserRole === enumData.UserType.Author.code) {
    query.createdBy = new mongoose.Types.ObjectId(req.userId) as any;
  }
  if (_q && typeof _q === "string") {
    query.$text = { $search: _q };
  }

  if (_cateName && typeof _cateName === "string" && _cateName !== "all") {
    query.name = _cateName;
  }

  try {
    const categories: ICategory[] = await Category.find(query, {
      ...(query.$text && { score: { $meta: "textScore" } }),
    });

    const finalCategories = await Promise.all(
      categories.map(async (cate: ICategory) => {
        const courses = await Course.countDocuments({
          categoryId: cate._id,
        });

        const categoryData = {
          _id: cate._id,
          name: cate.name,
          cateImage: cate.cateImage,
          cateSlug: cate.cateSlug,
          description: cate.description,
          courses,
          createdAt: cate.createdAt,
          updatedAt: cate.updatedAt,
        };

        return categoryData;
      })
    );

    res.status(200).json({
      message: "Fetch categories successfully!",
      categories: finalCategories,
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

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await Category.find();
    res.status(200).json({
      message: "Fetch all categories sucessfully!",
      categories,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch all categories!", 422);
      return next(customError);
    }
  }
};

export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  const { categoryId } = req.params;

  try {
    const category = await Category.findById(categoryId);

    res.status(200).json({
      message: "fetch single category successfully!",
      category,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch single category!", 422);
      return next(customError);
    }
  }
};

export const postCategory = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  let session: ClientSession | null = null;
  session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name, description } = req.body;

    await body("name")
      .isLength({ min: 3 })
      .withMessage("Please enter a input field category with at least 3 characters.")
      .custom(async (value) => {
        const categoryDoc = await Category.findOne({ name: value });
        if (categoryDoc) {
          throw new Error("Category exists already, please pick a different one.");
        }
      })
      .run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const firstError = errors.array()[0].msg;
      const validationError = new CustomError("Validation", firstError, 422);

      throw validationError;
    }

    const imageUrl = req.file ? req.file.path.replace("\\", "/") : "https://picsum.photos/200";
    const category = new Category({
      name,
      cateImage: imageUrl,
      description,
      createdBy: req.userId,
    });
    const categoryCreated = await category.save();

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Create category successfully!",
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to create category!", 422);
      return next(customError);
    }
  }
};

export const updateCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, cateSlug } = req.body;

    const { categoryId } = req.params;

    await body("name")
      .isLength({ min: 2 })
      .withMessage("Please enter a input field category with at least 3 characters.");

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const firstError = errors.array()[0].msg;
      const validationError = new CustomError("Validation", firstError, 422);

      throw validationError;
    }

    const updatedCategory = await Category.findById(categoryId);
    updatedCategory.name = name;
    updatedCategory.description = description;
    updatedCategory.cateSlug = cateSlug;

    const response = await updatedCategory.save();

    res.status(200).json({
      message: "Update category succesfully!",
      category: response,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to update category!", 422);
      return next(customError);
    }
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId } = req.params;

    const response = await Category.deleteOne({
      _id: categoryId,
    });
    res.status(200).json({
      message: "Category deleted successfully!",
      categoryId: categoryId,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to update category!", 422);
      return next(customError);
    }
  }
};
