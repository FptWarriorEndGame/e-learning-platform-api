import { Request, Response, NextFunction } from "express";
import Blog from "../../models/Blog";
import mongoose, { ClientSession } from "mongoose";
import CustomErrorMessage from "../../utils/errorMessage";
import { AuthorAuthRequest } from "../../middleware/is-auth";

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
import ActionLog from "../../models/ActionLog";
import CustomError from "../../utils/error";
import { enumData } from "../../config/enumData";
import { coreHelper } from "../../utils/coreHelper";

export const getBlogPrams = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  try {
    const searchTerm = (req.query._q as string) || "";
    const page = parseInt(req.query._page as string) || 1;
    const limit = parseInt(req.query._limit as string) || 10;
    const skip = (page - 1) * limit;
    const statusFilter = (req.query._status as string) || "all";
    const categoryId = req.query.categoryId as string;
    const searchAuthor = (req.query.author as string) || "";
    const tags = req.query.tags as string;

    let query: any = {
      ...(statusFilter === "active" ? { isDeleted: false } : {}),
      ...(statusFilter === "inactive" ? { isDeleted: true } : {}),
      ...(searchTerm ? { name: { $regex: searchTerm, $options: "i" } } : {}),
      ...(categoryId ? { categoryId: new mongoose.Types.ObjectId(categoryId) } : {}),
      ...(searchAuthor ? { author: searchAuthor } : {}),
      ...(tags ? { tags: tags } : {}),
    };

    const currentUserRole = req.role;
    if (currentUserRole && currentUserRole === enumData.UserType.Author.code) {
      query.createdBy = new mongoose.Types.ObjectId(req.userId) as any;
    }
    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

    res.status(200).json({
      message: GET_SUCCESS,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
      blogs,
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

export const getAllBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const blogs = await Blog.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.status(200).json({
      message: GET_SUCCESS,
      blogs,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: err instanceof Error ? err.message : "An unknown error occurred" });
  }
};

export const createBlog = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const {
    title,
    content,
    categoryId,
    tags = "",
    blogImg,
    author,
    readTime,
    userId,
    technology,
  } = req.body;

  let session: ClientSession | null = null;
  session = await mongoose.startSession();
  session.startTransaction();

  try {
    const blogCode = await coreHelper.getCodeDefault("BLOG", Blog);

    const blog = new Blog({
      code: blogCode,
      title,
      content,
      categoryId,
      tags: tags.split(",").map((tag) => tag.trim()), // Chuyển đổi chuỗi tags thành mảng
      blogImg,
      author,
      technology,
      readTime,
      userId,
      createdBy: req.userId,
      createdAt: new Date(),
      isDeleted: false,
    });

    const savedBlog = await blog.save();

    const historyItem = new ActionLog({
      referenceId: savedBlog._id,
      type: enumData.ActionLogEnType.Create.code,
      createdBy: req.userId,
      functionType: "Blog",
      description: `Blog [${savedBlog.title}] has been created by user [${req.userId}].`,
    });

    await historyItem.save();

    res.status(201).json({ message: CREATE_SUCCESS, blog: savedBlog });
  } catch (error) {
    next(error);
  }
};

export const getBlogById = async (req: Request, res: Response, next: NextFunction) => {
  const blogId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(blogId)) {
    return res.status(400).json({ message: "Invalid blog ID" });
  }

  try {
    const blog = await Blog.findOne({ _id: blogId })
      .populate("createdBy", "name")
      .populate("updatedBy", "name");

    if (!blog) {
      const error = new CustomError("Blog", ERROR_NOT_FOUND_DATA, 404);
      throw error;
    }
    res.status(200).json({
      message: "Get blog successfully",
      blog: blog,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const { title, content, categoryId, tags, blogImg, author } = req.body;
  const blogId = req.params.id;

  let session: ClientSession | null = null;
  session = await mongoose.startSession();
  session.startTransaction();

  try {
    const blog = await Blog.findById(blogId);

    if (!blog) {
      const error = new CustomError("Blog", ERROR_NOT_FOUND_DATA, 404);
      throw error;
    }

    blog.title = title;
    blog.content = content;
    blog.categoryId = categoryId;
    blog.tags = Array.isArray(tags) ? tags : tags.split(",").map((tag) => tag.trim());
    blog.blogImg = blogImg;
    blog.author = author;
    blog.updatedBy = new mongoose.Types.ObjectId(req.userId) as any;
    blog.updatedAt = new Date();

    const blogTypeRes = await blog.save();

    await blogTypeRes.save();

    const historyItem = new ActionLog({
      referenceId: blog._id,
      type: enumData.ActionLogEnType.Update.code,
      createdBy: req.userId,
      functionType: "Blog",
      description: `Blog [${blog.title}] has been updated by user [${req.userId}].`,
    });

    await historyItem.save();

    res.status(200).json({ message: UPDATE_SUCCESS, blog });
  } catch (error) {
    next(error);
  }
};

export const updateActiveBlogStatus = async (
  req: AuthorAuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { blogId } = req.body;

  let session: ClientSession | null = null;
  session = await mongoose.startSession();
  session.startTransaction();

  try {
    const blog = await Blog.findById(blogId);

    if (!blog) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }

    blog.isDeleted = !blog.isDeleted;
    blog.updatedAt = new Date();
    blog.updatedBy = new mongoose.Types.ObjectId(req.userId) as any;
    const BlogRes = await blog.save();

    const type =
      BlogRes.isDeleted === false
        ? `${enumData.ActionLogEnType.Activate.code}`
        : `${enumData.ActionLogEnType.Deactivate.code}`;
    const typeName =
      BlogRes.isDeleted === false
        ? `${enumData.ActionLogEnType.Activate.name}`
        : `${enumData.ActionLogEnType.Deactivate.name}`;
    const createdBy = new mongoose.Types.ObjectId(req.userId) as any;
    const historyDesc = `User [${req.username}] has [${typeName}] blog`;
    const functionType = "Blog";

    const historyItem = new ActionLog({
      blogId: BlogRes._id,
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

export const softDeleteBlog = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const blogId = req.params.id;
  try {
    const blog = await Blog.findById(blogId);

    if (!blog) {
      throw new CustomErrorMessage(ERROR_NOT_FOUND_DATA, 404);
    }

    blog.isDeleted = true;
    await blog.save();

    const historyItem = new ActionLog({
      referenceId: blog._id,
      type: enumData.ActionLogEnType.Deactivate.code,
      createdBy: req.userId,
      functionType: "Blog",
      description: `Blog [${blog.title}] has been soft deleted by user [${req.userId}].`,
    });

    await historyItem.save();

    res.status(200).json({ message: "Blog soft deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const loadHistoriesForBlog = async (req: Request, res: Response, next: NextFunction) => {
  const { blogId } = req.params;

  try {
    const page = parseInt(req.query._page as string) || 1;
    const limit = parseInt(req.query._limit as string) || 10;
    const skip = (page - 1) * limit;

    const [results, count] = await Promise.all([
      ActionLog.find({ blogId: blogId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ActionLog.countDocuments({ blogId: blogId }),
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

export const deleteBlogById = async (req: Request, res: Response, next: NextFunction) => {
  const blogId = req.params.id;
  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      const error = new CustomErrorMessage("Could not find blog", 422);
      error.statusCode = 404;
      throw error;
    }
    await Blog.findByIdAndRemove(blogId);
    res.status(200).json({
      message: "Delete blog successfully",
    });
  } catch (error) {
    next(error);
  }
};
