import { NextFunction, Request, Response } from "express";
import BlogComment from "../../models/BlogComment";
import { coreHelper } from "../../utils/coreHelper";
import CustomError from "../../utils/error";
import CustomErrorMessage from "../../utils/errorMessage";
import { enumData } from "../../config/enumData";
import { AuthorAuthRequest } from "../../middleware/is-auth";
import mongoose, { ClientSession } from "mongoose";
import ActionLog from "../../models/ActionLog";
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
import BLog from "../../models/Blog";

export const getAllBlogComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const comments = await BlogComment.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .populate("blogId", "title");
    res.json({ comments });
  } catch (err) {
    res
      .status(500)
      .json({ message: err instanceof Error ? err.message : "An unknown error occurred" });
  }
};

export const getCommentsBlog = async (
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
    const total = await BlogComment.countDocuments(query);

    const comments = await BlogComment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name")
      .populate({
        path: "replies",
        populate: { path: "userId", select: "name avatar" },
      });

    let listBlogIdOfCurrentAuthor = [];
    if (req.userId && req.role === enumData.UserType.Author.code) {
      const listBlogOfCurrentAuthor = await BLog.find({
        createdBy: req.userId,
      });
      listBlogIdOfCurrentAuthor = listBlogOfCurrentAuthor.map((blog) => blog._id);
    }
    const blogCommentsRes = comments.filter((blogCommentItem: any) => {
      if (listBlogIdOfCurrentAuthor.length > 0) {
        return listBlogIdOfCurrentAuthor.includes(blogCommentItem?.blogId?.toString());
      }
      return true;
    });

    res.status(200).json({
      message: GET_SUCCESS,
      total: blogCommentsRes.length,
      page,
      pages: Math.ceil(total / limit),
      limit,
      comments: blogCommentsRes,
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

export const addComment = async (req: AuthorAuthRequest, res: Response) => {
  const { content, userId, blogId, parentCommentId } = req.body;

  let session: ClientSession | null = null;
  session = await mongoose.startSession();
  session.startTransaction();
  try {
    const blogCommentsCode = await coreHelper.getCodeDefault("BLOGCOMMENT", BlogComment);

    const newComment = new BlogComment({
      code: blogCommentsCode,
      content,
      userId,
      blogId,
      parentCommentId: parentCommentId || null,
      likes: [],
      createdBy: req.userId,
    });
    const savedComment = await newComment.save();

    const historyItem = new ActionLog({
      referenceId: savedComment._id,
      type: enumData.ActionLogEnType.Create.code,
      createdBy: new mongoose.Types.ObjectId(req.userId),
      functionType: "BlogCommetns",
      description: `BlogCommetns has [${enumData.ActionLogEnType.Create.name}] action by user [${req.userId}]`,
    });
    await ActionLog.collection.insertOne(historyItem.toObject(), { session });
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: CREATE_SUCCESS, blogComment: savedComment });
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

export const getCommentsByBlogId = async (req: Request, res: Response) => {
  try {
    const { blogId } = req.params;
    const comments = await BlogComment.findOne({ blogId, parentCommentId: null })
      .populate({
        path: "replies",
        populate: { path: "userId", select: "name avatar" },
      })
      .populate("createdBy", "name")
      .populate("updatedBy", "name");

    if (!comments) {
      const error = new CustomError("Blog Comments", ERROR_NOT_FOUND_DATA, 404);
      throw error;
    }
    res.json({ comments });
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const updatedComment = await BlogComment.findByIdAndUpdate(
      commentId,
      { content },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json(updatedComment);
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;

    const deletedComment = await BlogComment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

export const toggleLikeComment = async (req: Request, res: Response) => {
  const { commentId, userId } = req.body;

  try {
    const comment = await BlogComment.findById(commentId);

    if (!comment) {
      return res.status(404).send("Comment not found");
    }

    const likeIndex = comment.likes.indexOf(userId);

    if (likeIndex === -1) {
      comment.likes.push(userId);
    } else {
      comment.likes.splice(likeIndex, 1);
    }

    const updatedComment = await comment.save();
    res.json(updatedComment);
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

export const addReplyToComment = async (req: Request, res: Response) => {
  const { content, userId, blogId, parentCommentId } = req.body;

  try {
    // Find the parent comment and ensure it exists
    const parentComment = await BlogComment.findById(parentCommentId);
    if (!parentComment) {
      return res.status(404).json({ error: "Parent comment not found." });
    }

    // Create a new comment as a reply
    const newReply = new BlogComment({
      content,
      userId,
      blogId,
      parentCommentId,
    });

    // Save the new reply
    const savedReply = await newReply.save();

    parentComment.replies.push(savedReply._id);
    await parentComment.save();

    // Populate necessary fields for the response
    await savedReply.populate("userId", "name avatar");

    res.status(201).json(savedReply);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateActiveCategoryBlogStatus = async (
  req: AuthorAuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { commentId } = req.body;
  let session: ClientSession | null = null;
  session = await mongoose.startSession();
  session.startTransaction();

  try {
    const blogComment = await BlogComment.findById(commentId);

    if (!blogComment) {
      res.status(404).json({ message: "Blog Comment not found" });
      return;
    }

    blogComment.isDeleted = !blogComment.isDeleted;
    blogComment.updatedAt = new Date();
    blogComment.updatedBy = new mongoose.Types.ObjectId(req.userId) as any;
    const BlogCommentRes = await blogComment.save();

    const type =
      BlogCommentRes.isDeleted === false
        ? `${enumData.ActionLogEnType.Activate.code}`
        : `${enumData.ActionLogEnType.Deactivate.code}`;
    const typeName =
      BlogCommentRes.isDeleted === false
        ? `${enumData.ActionLogEnType.Activate.name}`
        : `${enumData.ActionLogEnType.Deactivate.name}`;
    const createdBy = new mongoose.Types.ObjectId(req.userId) as any;
    const historyDesc = `User [${req.username}] has [${typeName}] blogComment`;
    const functionType = "blogComment";

    const historyItem = new ActionLog({
      commentId: BlogCommentRes._id,
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
  const { commentId } = req.params;

  try {
    const page = parseInt(req.query._page as string) || 1;
    const limit = parseInt(req.query._limit as string) || 10;
    const skip = (page - 1) * limit;

    const [results, count] = await Promise.all([
      ActionLog.find({ commentId: commentId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ActionLog.countDocuments({ commentId: commentId }),
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
