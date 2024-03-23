import { NextFunction, Request, Response } from "express";
import CourseDiscuss from "../../models/CourseDisscuss";
import { coreHelper } from "../../utils/coreHelper";
import { AuthorAuthRequest } from "../../middleware/is-auth";
import { enumData } from "../../config/enumData";
import mongoose, { ClientSession } from "mongoose";
import {
  CREATE_SUCCESS,
  ERROR_GET_DATA,
  ERROR_GET_DATA_HISTORIES,
  ERROR_UPDATE_ACTIVE_DATA,
  GET_HISOTIES_SUCCESS,
  GET_SUCCESS,
  UPDATE_ACTIVE_SUCCESS,
} from "../../config/constant";
import CustomError from "../../utils/error";
import CustomErrorMessage from "../../utils/errorMessage";
import ActionLog from "../../models/ActionLog";
import { session } from "passport";
import Course from "../../models/Course";

export const getAllDiscurdCourse = async (req: Request, res: Response) => {
  try {
    const discuss = await CourseDiscuss.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .populate("userId", "name")
      .populate({
        path: "replies",
        populate: { path: "userId", select: "name avatar" },
      });

    res.json({ discuss });
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

export const getDiscuss = async (req: AuthorAuthRequest, res: Response) => {
  try {
    const searchTerm = (req.query._q as string) || "";
    const page = parseInt(req.query._page as string, 10) || 1;
    const limit = parseInt(req.query._limit as string, 10) || 10;
    const skip = (page - 1) * limit;
    const statusFilter = (req.query._status as string) || "all";

    let query: any = {
      ...(statusFilter === "active" ? { isDeleted: false } : {}),
      ...(statusFilter === "inactive" ? { isDeleted: true } : {}),
      ...(searchTerm ? { name: { $regex: searchTerm, $options: "i" } } : {}),
    };

    if (req.role && req.role === enumData.UserType.Author.code) {

        const listCourseOfCurrentUser = await Course.find({
          createdBy: req.userId
        })
        const listCourseIdOfCurrentUser = listCourseOfCurrentUser.map((course) => course._id);
        query.courseId = {
          $in: listCourseIdOfCurrentUser
        }
      // query.createdBy = new mongoose.Types.ObjectId(req.userId) as any;
    }

    const total = await CourseDiscuss.countDocuments(query);
    const discuss = await CourseDiscuss.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name avatar");

    res.status(200).json({
      message: "Fetch data successfully",
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
      discuss,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Error fetching discussions", error: error.message });
  }
};

export const getDiscussById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const discuss = await CourseDiscuss.findById(id)
      .populate("userId", "name avatar")
      .populate({
        path: "replies",
        populate: { path: "userId", select: "name avatar" },
      });

    if (!discuss) {
      return res.status(404).json({ error: "Discuss not found" });
    }

    res.json({ discuss });
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

export const getDiscussByLessonId = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const discuss = await CourseDiscuss.findOne({ lessonId })
      .populate({
        path: "replies",
        populate: { path: "userId", select: "name avatar" },
      })
      .populate("userId", "name avatar")
      .populate({
        path: "replies",
        populate: { path: "userId", select: "name avatar" },
      });

    res.json({ discuss });
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

export const getDiscussBySectionId = async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params;
    const discuss = await CourseDiscuss.find({ sectionId: sectionId })
      .populate("userId", "name avatar")
      .populate({
        path: "replies",
        populate: { path: "userId", select: "name avatar" },
      });

    res.json({ discuss });
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

export const addDiscussCourse = async (req: AuthorAuthRequest, res: Response) => {
  try {
    let session: ClientSession | null = null;
    session = await mongoose.startSession();
    session.startTransaction();
    const { comments, userId, parentDiscussId, lessonId, courseId } = req.body;

    const addDiscussCourseCode = await coreHelper.getCodeDefault("DISCUSS", CourseDiscuss);

    const newComment = new CourseDiscuss({
      code: addDiscussCourseCode,
      courseId,
      lessonId,
      comments,
      userId,
      parentDiscussId: parentDiscussId || null,
    });
    const savedComment = await newComment.save();

    const historyItem = new ActionLog({
      referenceId: savedComment._id,
      type: enumData.ActionLogEnType.Create.code,
      createdBy: new mongoose.Types.ObjectId(req.userId),
      functionType: "DISCUSS",
      description: `DISCUSS has [${enumData.ActionLogEnType.Create.name}] action by user [${req.userId}]`,
    });
    await ActionLog.collection.insertOne(historyItem.toObject(), { session });
    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ message: CREATE_SUCCESS, discuss: savedComment });
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

export const updateDiscussCourse = async (req: AuthorAuthRequest, res: Response) => {
  try {
    const { discussId } = req.params;
    const { comments } = req.body;

    let session: ClientSession | null = null;
    session = await mongoose.startSession();
    session.startTransaction();

    const updatedComment = await CourseDiscuss.findByIdAndUpdate(
      discussId,
      { comments },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    updatedComment.comments = comments;
    updatedComment.updatedAt = new Date();
    updatedComment.updatedBy = new mongoose.Types.ObjectId(req.userId) as any;

    const updatedCommentRes = await updatedComment.save();

    const historyItem = new ActionLog({
      blogdiscussTypeId: updatedCommentRes._id,
      type: enumData.ActionLogEnType.Update.code,
      createdBy: new mongoose.Types.ObjectId(req.userId) as any,
      functionType: "DISCUSS",
      description: `User [${req.username}] has [${enumData.ActionLogEnType.Update.name}] DISCUSS`,
    });

    await ActionLog.collection.insertOne(historyItem.toObject(), { session });
    await session.commitTransaction();
    session.endSession();
    res.json(updatedComment);
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

export const deleteDiscuss = async (req: Request, res: Response) => {
  try {
    const { discussId } = req.params;

    const deletedComment = await CourseDiscuss.findByIdAndDelete(discussId);

    if (!deletedComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

export const addReplyToDiscuss = async (req: Request, res: Response) => {
  const { comments, userId, parentDiscussId } = req.body;

  try {
    const parentComment = await CourseDiscuss.findById(parentDiscussId);
    if (!parentComment) {
      return res.status(404).json({ error: "Parent comment not found." });
    }

    const addDiscussCourseReplyCode = await coreHelper.getCodeDefault(
      "DISCUSSREPLY",
      CourseDiscuss
    );

    // Create a new comment as a reply
    const newReply = new CourseDiscuss({
      code: addDiscussCourseReplyCode,
      discussId: parentComment.discussId,
      comments,
      userId,
      parentDiscussId,
    });
    const savedReply = await newReply.save();

    parentComment.replies.push(savedReply._id);
    await parentComment.save();

    await savedReply.populate("userId", "name avatar");

    res.status(201).json(savedReply);
  } catch (error: any) {
    console.error("Error in addReplyToDiscuss:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateActiveDiscuss = async (
  req: AuthorAuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { discussId } = req.body;
  let session: ClientSession | null = null;
  session = await mongoose.startSession();
  session.startTransaction();

  try {
    const discuss = await CourseDiscuss.findById(discussId);

    if (!discuss) {
      res.status(404).json({ message: "discuss not found" });
      return;
    }

    discuss.isDeleted = !discuss.isDeleted;
    discuss.updatedAt = new Date();
    discuss.updatedBy = new mongoose.Types.ObjectId(req.userId) as any;
    const discussRes = await discuss.save();

    const type =
      discussRes.isDeleted === false
        ? `${enumData.ActionLogEnType.Activate.code}`
        : `${enumData.ActionLogEnType.Deactivate.code}`;
    const typeName =
      discussRes.isDeleted === false
        ? `${enumData.ActionLogEnType.Activate.name}`
        : `${enumData.ActionLogEnType.Deactivate.name}`;
    const createdBy = new mongoose.Types.ObjectId(req.userId) as any;
    const historyDesc = `User [${req.username}] has [${typeName}] DISCUSS`;
    const functionType = "DISCUSS";

    const historyItem = new ActionLog({
      discussId: discussRes._id,
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

export const loadHistoriesForDiscuss = async (req: Request, res: Response, next: NextFunction) => {
  const { discussId } = req.params;

  try {
    const page = parseInt(req.query._page as string) || 1;
    const limit = parseInt(req.query._limit as string) || 10;
    const skip = (page - 1) * limit;

    const [results, count] = await Promise.all([
      ActionLog.find({ discussId: discussId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ActionLog.countDocuments({ discussId: discussId }),
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
