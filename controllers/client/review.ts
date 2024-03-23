import { Request, Response, NextFunction } from "express";
import Review from "../../models/Review";
import ReviewReply from "../../models/ReviewReply";
import Order from "../../models/Order";
import CustomError from "../../utils/error";
import CustomErrorMessage from "../../utils/errorMessage";
import mongoose, { ClientSession } from "mongoose";
import { coreHelper } from "../../utils/coreHelper";
import ActionLog from "../../models/ActionLog";
import { enumData } from "../../config/enumData";
import { UserAuthRequest } from "../../middleware/is-user-auth";
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

export const postReview = async (req: UserAuthRequest, res: Response, next: NextFunction) => {
  const { courseId, title, content, ratingStar, orderId, userId } = req.body;

  let session: ClientSession | null = null;

  session = await mongoose.startSession();
  session.startTransaction();

  try {
    const reviewCode = await coreHelper.getCodeDefault("REVIEW", Review);

    const review = new Review({
      code: reviewCode,
      courseId,
      title,
      content,
      ratingStar,
      orderId,
      userId,
      createdBy: userId,
    });

    const reviewRes = await review.save();

    await Order.updateOne(
      { _id: orderId, "items._id": courseId },
      { $set: { "items.$.reviewed": true } }
    );

    const historyItem = new ActionLog({
      reviewId: reviewRes._id,
      type: enumData.ActionLogEnType.Create.code,
      createdBy: new mongoose.Types.ObjectId(req.userId),
      functionType: "REVIEW",
      description: `User [${req.username}] has [${enumData.ActionLogEnType.Create.name}] Review`,
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

export const getReviewsByCourseId = async (req: Request, res: Response, next: NextFunction) => {
  const { courseId } = req.params;
  const searchTerm = (req.query._q as string) || "";
  const page = parseInt(req.query._page as string) || 1;
  const limit = parseInt(req.query._limit as string) || 10;
  const skip = (page - 1) * limit;

  try {
    let searchCondition = searchTerm
      ? { title: { $regex: searchTerm, $options: "i" } }
      : ({} as any);

    if (req.query._rating) {
      const ratingValue = parseInt(req.query._rating as string);
      const groupedRatings = {
        "1": [0.5, 1, 1.5],
        "2": [2, 2.5],
        "3": [3, 3.5],
        "4": [4, 4.5],
        "5": [5],
      };

      const selectedRatings = groupedRatings[ratingValue.toString()];

      if (selectedRatings) {
        searchCondition.ratingStar = { $in: selectedRatings };
      }
    }

    const [reviews, total] = await Promise.all([
      Review.find({ courseId: courseId, isDeleted: false, ...searchCondition })
        .populate({
          path: "createdBy",
          select: "name avatar",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ courseId: courseId, isDeleted: false, ...searchCondition }),
    ]);

    if (!reviews) {
      return next(new CustomErrorMessage(ERROR_NOT_FOUND_DATA, 404));
    }

    res.status(200).json({
      message: GET_SUCCESS,
      reviews,
      total,
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

export const getReviewRepliesByReviewId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { reviewId } = req.params;

  try {
    const replies = await ReviewReply.find({ reviewId: reviewId, isDeleted: false })
      .populate({
        path: "createdBy",
        select: "name avatar",
      })
      .sort({ createdAt: -1 })
      .lean();

    if (!replies) {
      return next(new CustomErrorMessage(ERROR_NOT_FOUND_DATA, 404));
    }

    res.status(200).json({
      message: GET_SUCCESS,
      replies,
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

export const getTotalReviewsByCourseId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { courseId } = req.params;

  try {
    const totalReviews = await Review.countDocuments({ courseId: courseId, isDeleted: false });

    res.status(200).json({
      message: GET_SUCCESS,
      totalReviews,
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

export const getAverageRatingByCourseId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { courseId } = req.params;

  try {
    const averageRating = await Review.aggregate([
      { $match: { courseId: new mongoose.Types.ObjectId(courseId), isDeleted: false } },
      {
        $group: {
          _id: "$courseId",
          averageRating: { $avg: "$ratingStar" },
        },
      },
    ]);

    const rating = averageRating.length > 0 ? averageRating[0].averageRating : 0;

    res.status(200).json({
      message: GET_SUCCESS,
      averageRating: rating,
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

export const getRatingPercentageByCourseId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { courseId } = req.params;

  try {
    const totalReviews = await Review.countDocuments({ courseId: courseId, isDeleted: false });
    if (totalReviews === 0) {
      return res.status(200).json({
        message: ERROR_NOT_FOUND_DATA,
        ratingPercentages: {},
      });
    }

    const groupedRatings = {
      "1": [0.5, 1, 1.5],
      "2": [2, 2.5],
      "3": [3, 3.5],
      "4": [4, 4.5],
      "5": [5],
    };

    const ratingPercentages = {};

    for (let group in groupedRatings) {
      let count = 0;
      for (let value of groupedRatings[group]) {
        count += await Review.countDocuments({
          courseId: courseId,
          ratingStar: value,
          isDeleted: false,
        });
      }
      ratingPercentages[group] = ((count / totalReviews) * 100).toFixed(2) + "%";
    }

    res.status(200).json({
      message: GET_SUCCESS,
      ratingPercentages,
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
