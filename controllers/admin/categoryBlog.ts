import { NextFunction, Request, Response } from "express";
import mongoose, { ClientSession } from "mongoose";
import { enumData } from "../../config/enumData";
import { AuthorAuthRequest } from "../../middleware/is-auth";
import ActionLog from "../../models/ActionLog";
import BlogCategory from "../../models/BlogCategory";
import { coreHelper } from "../../utils/coreHelper";
import CustomError from "../../utils/error";
import CustomErrorMessage from "../../utils/errorMessage";

import {
  CREATE_SUCCESS,
  ERROR_GET_DATA,
  ERROR_GET_DATA_HISTORIES,
  ERROR_NOT_FOUND_DATA,
  ERROR_UPDATE_ACTIVE_DATA,
  GET_HISOTIES_SUCCESS,
  GET_SUCCESS,
  UPDATE_ACTIVE_SUCCESS,
  UPDATE_SUCCESS,
} from "../../config/constant";

export const getCategoryBlog = async (
  req: AuthorAuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const searchTerm = (req.query._q as string) || "";
    const page = parseInt(req.query._page as string) || 1;
    const limit = parseInt(req.query._limit as string) || 10;
    const skip = (page - 1) * limit;

    const statusFilter = (req.query._status as string) || "all";

    let query: any = {
      ...(statusFilter === "active" ? { isDeleted: false } : {}),
      ...(statusFilter === "inactive" ? { isDeleted: true } : {}),
      ...(searchTerm ? { name: { $regex: searchTerm, $options: "i" } } : {}),
    };
    const currentUserRole = req.role;
    if (currentUserRole && currentUserRole === enumData.UserType.Author.code) {
      query.createdBy = new mongoose.Types.ObjectId(req.userId) as any;
    }
    const total = await BlogCategory.countDocuments(query);

    const blogsCategories = await BlogCategory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: GET_SUCCESS,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
      blogsCategories,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage(ERROR_GET_DATA, 422);
      return next(customError);
    }
  }
};

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await BlogCategory.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.json({ blogCategories: categories });
  } catch (err) {
    res
      .status(500)
      .json({ message: err instanceof Error ? err.message : "An unknown error occurred" });
  }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const category = await BlogCategory.findOne({ _id: id })
      .populate("createdBy", "name")
      .populate("updatedBy", "name");
    if (!category) {
      const error = new CustomError("Category Blog", ERROR_NOT_FOUND_DATA, 404);
      throw error;
    }
    res.json({ blogsCategories: category });
  } catch (err) {
    res
      .status(500)
      .json({ message: err instanceof Error ? err.message : "An unknown error occurred" });
  }
};

export const createCategory = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const { name, description } = req.body;

  const imageUrl = req.file ? req.file.path.replace("\\", "/") : `https://picsum.photos/200`;
  
  let session: ClientSession | null = null;
  session = await mongoose.startSession();
  session.startTransaction();

  try {
    const categoryBlogCode = await coreHelper.getCodeDefault("BLOGCATEGORY", BlogCategory);

    const blogCategory = new BlogCategory({
      name,
      description,
      cateImage: imageUrl,
      code: categoryBlogCode,
      createdBy: req.userId,
    });

    const savedBlogCategory = await blogCategory.save();

    const historyItem = new ActionLog({
      referenceId: savedBlogCategory._id,
      type: enumData.ActionLogEnType.Create.code,
      createdBy: new mongoose.Types.ObjectId(req.userId),
      functionType: "BlogCategory",
      description: `BlogCategory [${name}] has [${enumData.ActionLogEnType.Create.name}] action by user [${req.userId}]`,
    });

    await ActionLog.collection.insertOne(historyItem.toObject(), { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: CREATE_SUCCESS, blogCategory: savedBlogCategory });
  } catch (error) {
    if (session) await session.abortTransaction();
    next(error);
  } finally {
    if (session) session.endSession();
  }
};

export const updateCategory = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const { name, description, cateImage, _id } = req.body;

  let session: ClientSession | null = null;

  session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedBlogCategory = await BlogCategory.findById(_id);

    if (!updatedBlogCategory) {
      const error = new CustomError("BlogCategory", ERROR_NOT_FOUND_DATA, 404);
      throw error;
    }

    updatedBlogCategory.name = name;
    updatedBlogCategory.description = description;
    updatedBlogCategory.cateImage = cateImage;
    updatedBlogCategory.updatedAt = new Date();
    updatedBlogCategory.updatedBy = new mongoose.Types.ObjectId(req.userId) as any;

    const blogCategoryTypeRes = await updatedBlogCategory.save();

    // Log the update action
    const historyItem = new ActionLog({
      blogCategoryTypeId: blogCategoryTypeRes._id,
      type: enumData.ActionLogEnType.Update.code,
      createdBy: new mongoose.Types.ObjectId(req.userId) as any,
      functionType: "BlogCategory",
      description: `User [${req.username}] has [${enumData.ActionLogEnType.Update.name}] Blog Category`,
    });

    await ActionLog.collection.insertOne(historyItem.toObject(), { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: UPDATE_SUCCESS, blogCategory: updatedBlogCategory });
  } catch (error) {
    if (session) await session.abortTransaction();
    next(error);
  } finally {
    if (session) session.endSession();
  }
};

export const updateActiveCategoryBlogStatus = async (
  req: AuthorAuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { blogCategoryTypeId } = req.body;
  let session: ClientSession | null = null;
  session = await mongoose.startSession();
  session.startTransaction();

  try {
    const category = await BlogCategory.findById(blogCategoryTypeId);

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    category.isDeleted = !category.isDeleted;
    category.updatedAt = new Date();
    category.updatedBy = new mongoose.Types.ObjectId(req.userId) as any;
    const categoryBlogRes = await category.save();

    const type =
      categoryBlogRes.isDeleted === false
        ? `${enumData.ActionLogEnType.Activate.code}`
        : `${enumData.ActionLogEnType.Deactivate.code}`;
    const typeName =
      categoryBlogRes.isDeleted === false
        ? `${enumData.ActionLogEnType.Activate.name}`
        : `${enumData.ActionLogEnType.Deactivate.name}`;
    const createdBy = new mongoose.Types.ObjectId(req.userId) as any;
    const historyDesc = `User [${req.username}] has [${typeName}] category blog`;
    const functionType = "BlogCategory";

    const historyItem = new ActionLog({
      blogCategoryTypeId: categoryBlogRes._id,
      type,
      createdBy,
      functionType,
      description: historyDesc,
    });

    await ActionLog.collection.insertOne(historyItem.toObject(), {
      session: session,
    });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: UPDATE_ACTIVE_SUCCESS,
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage(ERROR_UPDATE_ACTIVE_DATA, 422);
      return next(customError);
    }
  }
};

export const loadHistoriesForCategoryBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { blogCategoryTypeId } = req.params;

  try {
    const page = parseInt(req.query._page as string) || 1;
    const limit = parseInt(req.query._limit as string) || 10;
    const skip = (page - 1) * limit;

    const [results, count] = await Promise.all([
      ActionLog.find({ blogCategoryTypeId: blogCategoryTypeId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ActionLog.countDocuments({ blogCategoryTypeId: blogCategoryTypeId }),
    ]);

    res.status(200).json({
      message: GET_HISOTIES_SUCCESS,
      results: results,
      count,
      page,
      pages: Math.ceil(count / limit),
      limit,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage(ERROR_GET_DATA_HISTORIES, 422);
      return next(customError);
    }
  }
};
