import { Request, Response, NextFunction } from "express";
import Review from "../../models/Review";
import ReviewReply from "../../models/ReviewReply";
import CustomError from "../../utils/error";
import CustomErrorMessage from "../../utils/errorMessage";
import mongoose, { ClientSession } from "mongoose";
import { coreHelper } from "../../utils/coreHelper";
import ActionLog from "../../models/ActionLog";
import { enumData } from "../../config/enumData";
import { AuthorAuthRequest } from "../../middleware/is-auth";
import {
  CREATE_SUCCESS,
  ERROR_CREATE_DATA,
  ERROR_GET_DATA,
  ERROR_GET_DATA_DETAIL,
  ERROR_GET_DATA_HISTORIES,
  ERROR_NOT_FOUND_DATA,
  ERROR_UPDATE_ACTIVE_DATA,
  ERROR_UPDATE_DATA,
  GET_DETAIL_SUCCESS,
  GET_HISOTIES_SUCCESS,
  GET_SUCCESS,
  UPDATE_ACTIVE_SUCCESS,
  UPDATE_SUCCESS,
} from "../../config/constant";
import Course from "../../models/Course";

export const getReviews = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  try {
    const searchTerm = (req.query._q as string) || "";
    const page = parseInt(req.query._page as string) || 1;
    const limit = parseInt(req.query._limit as string) || 10;
    const skip = (page - 1) * limit;

    const statusFilter = (req.query._status as string) || "all";

    let query = {
      ...(statusFilter === "active" ? { isDeleted: false } : {}),
      ...(statusFilter === "inactive" ? { isDeleted: true } : {}),
      ...(searchTerm ? { title: { $regex: searchTerm, $options: "i" } } : {}),
    };

    const total = await Review.countDocuments(query);

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .populate("userId", "name")
      .populate("courseId", "name")
      .skip(skip)
      .limit(limit);

    let reviewsWithReplies = await Promise.all(
      reviews.map(async (review) => {
        const replyCount = await ReviewReply.countDocuments({ reviewId: review._id });
        const hasReplies = replyCount > 0;
        return {
          ...review.toObject(),
          hasReplies,
          replyCount,
        };
      })
    );

      if(req.userId && req.role === enumData.UserType.Author.code) {
        const listCourseByCurrentAuthor = await Course.find({ createdBy: req.userId });
        const listCourseIdByCurrentAuthor = listCourseByCurrentAuthor.map((item) => item._id.toString());

        reviewsWithReplies.filter((item: any) => {
          return listCourseIdByCurrentAuthor.includes(item.courseId._id.toString())
        })
      }


    res.status(200).json({
      message: GET_SUCCESS,
      total: reviewsWithReplies.length,
      page,
      pages: Math.ceil(total / limit),
      limit,
      reviews: reviewsWithReplies,
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

export const getReviewById = async (req: Request, res: Response, next: NextFunction) => {
  const { reviewId } = req.params;

  try {
    const review = await Review.findOne({ _id: reviewId })
      .populate("userId", "name")
      .populate("createdBy", "name")
      .populate("updatedBy", "name")
      .populate("courseId", "name");

    if (!review) {
      const error = new CustomError("Review", ERROR_NOT_FOUND_DATA, 404);
      throw error;
    }

    res.status(200).json({
      message: GET_DETAIL_SUCCESS,
      review,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage(ERROR_GET_DATA_DETAIL, 422);
      return next(customError);
    }
  }
};

export const updateActiveStatusReview = async (
  req: AuthorAuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { reviewId } = req.body;

  let session: ClientSession | null = null;
  session = await mongoose.startSession();
  session.startTransaction();

  try {
    const foundReview = await Review.findById(reviewId);

    if (!foundReview) {
      const error = new CustomError("Review", ERROR_NOT_FOUND_DATA, 404);
      throw error;
    }

    foundReview.isDeleted = !foundReview.isDeleted;
    foundReview.updatedAt = new Date();
    foundReview.updatedBy = new mongoose.Types.ObjectId(req.userId) as any;

    const reviewRes = await foundReview.save();

    const type =
      foundReview.isDeleted === false
        ? `${enumData.ActionLogEnType.Activate.code}`
        : `${enumData.ActionLogEnType.Deactivate.code}`;
    const typeName =
      foundReview.isDeleted === false
        ? `${enumData.ActionLogEnType.Activate.name}`
        : `${enumData.ActionLogEnType.Deactivate.name}`;

    const createdBy = new mongoose.Types.ObjectId(req.userId) as any;
    const historyDesc = `User [${req.username}] has [${typeName}] Review`;
    const functionType = "REVIEW";

    const historyItem = new ActionLog({
      reviewId: reviewRes._id,
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

export const loadHistoriesForReview = async (req: Request, res: Response, next: NextFunction) => {
  const { reviewId } = req.params;

  try {
    const page = parseInt(req.query._page as string) || 1;
    const limit = parseInt(req.query._limit as string) || 10;
    const skip = (page - 1) * limit;

    const [results, count] = await Promise.all([
      ActionLog.find({ reviewId: reviewId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ActionLog.countDocuments({ reviewId: reviewId }),
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

export const getReviewRepliesByReviewId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { reviewId } = req.params;

  try {
    const page = parseInt(req.query._page as string) || 1;
    const limit = parseInt(req.query._limit as string) || 10;
    const skip = (page - 1) * limit;

    const [reviewReplies, count] = await Promise.all([
      ReviewReply.find({ reviewId })
        .populate("createdBy", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ReviewReply.countDocuments({ reviewId }),
    ]);

    res.status(200).json({
      message: GET_DETAIL_SUCCESS,
      reviewReplies,
      count,
      page,
      pages: Math.ceil(count / limit),
      limit,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage(ERROR_GET_DATA_DETAIL, 422);
      return next(customError);
    }
  }
};

export const postReviewReply = async (
  req: AuthorAuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { reviewId, contentReply } = req.body;

  let session: ClientSession | null = null;

  session = await mongoose.startSession();
  session.startTransaction();

  try {
    const reviewReplyCode = await coreHelper.getCodeDefault("REVIEW_REPLY", ReviewReply);

    const reviewReply = new ReviewReply({
      code: reviewReplyCode,
      reviewId,
      contentReply,
      createdBy: req.userId,
    });

    const reviewReplyRes = await reviewReply.save();

    const historyItem = new ActionLog({
      reviewId: reviewId,
      type: enumData.ActionLogEnType.Create.code,
      createdBy: new mongoose.Types.ObjectId(req.userId),
      functionType: "REVIEW_REPLY",
      description: `User [${req.username}] has [${enumData.ActionLogEnType.Create.name}] Review Reply with Content: [${contentReply}]`,
    });

    await ActionLog.collection.insertOne(historyItem.toObject(), { session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: CREATE_SUCCESS,
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage(ERROR_CREATE_DATA, 422);
      return next(customError);
    }
  }
};

export const updateActiveStatusReviewReply = async (
  req: AuthorAuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { reviewReplyId } = req.body;

  let session: ClientSession | null = null;
  session = await mongoose.startSession();
  session.startTransaction();

  try {
    const foundReviewReply = await ReviewReply.findById(reviewReplyId);

    if (!foundReviewReply) {
      const error = new CustomError("Review Reply", ERROR_NOT_FOUND_DATA, 404);
      throw error;
    }

    foundReviewReply.isDeleted = !foundReviewReply.isDeleted;
    foundReviewReply.updatedAt = new Date();
    foundReviewReply.updatedBy = new mongoose.Types.ObjectId(req.userId) as any;

    const reviewReplyRes = await foundReviewReply.save();

    const type =
      foundReviewReply.isDeleted === false
        ? `${enumData.ActionLogEnType.Activate.code}`
        : `${enumData.ActionLogEnType.Deactivate.code}`;
    const typeName =
      foundReviewReply.isDeleted === false
        ? `${enumData.ActionLogEnType.Activate.name}`
        : `${enumData.ActionLogEnType.Deactivate.name}`;

    const createdBy = new mongoose.Types.ObjectId(req.userId) as any;
    const historyDesc = `User [${req.username}] has [${typeName}] Review Reply with Content: [${reviewReplyRes.contentReply}]`;
    const functionType = "REVIEW_REPLY";

    const historyItem = new ActionLog({
      reviewId: reviewReplyRes.reviewId,
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
