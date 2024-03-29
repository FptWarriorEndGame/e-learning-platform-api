import { Request, Response, NextFunction } from "express";
import Course from "../../models/Course";
import Coupon from "../../models/Coupon";
import { getCourseDetailInfo } from "../../utils/helper";
import CustomError from "../../utils/error";
import CustomErrorMessage from "../../utils/errorMessage";
import { calculateTotalPrice, getCoursesOrderedByUserInfo } from "../../utils/helper";
import mongoose, { ClientSession } from "mongoose";
import { coreHelper } from "../../utils/coreHelper";
import ActionLog from "../../models/ActionLog";
import { enumData } from "../../config/enumData";
import { COUPON_TYPES } from "../../config/constant";
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

export const retrieveCartByIds = async (req: Request, res: Response, next: NextFunction) => {
  const { _courseIds, _userId } = req.query;

  if (!_courseIds) {
    res.status(200).json({
      message: "Cart is empty!",
      cart: {
        items: [],
        totalPrice: 0,
      },
      duplicatedIds: [],
    });

    return;
  }

  try {
    const courseIdsArray =
      typeof _courseIds === "string"
        ? _courseIds.split(",").map((id) => id.trim())
        : ([] as string[]);

    let orderedCourseIds: string[] = [];

    if (_userId && typeof _userId === "string" && _userId.trim() !== "") {
      const orderedCourses = await getCoursesOrderedByUserInfo(_userId);
      orderedCourseIds = orderedCourses.map((course) => course._id.toString());
    }

    const duplicatedIds = orderedCourseIds.filter((id) => courseIdsArray.includes(id));

    const courses = await Course.find({
      _id: { $in: courseIdsArray },
    }).select("_id name finalPrice thumbnail userId level createdBy").populate("createdBy", "_id name avatar");

    const totalPrice = courses.reduce((acc, course) => acc + course.finalPrice, 0);

    const result = [];
    // TODO FIX LATER!
    for (const course of courses) {
      const courseDetailInfo = await getCourseDetailInfo(course._id);
        const cartItem = {
          _id: courseDetailInfo._id,
          name: courseDetailInfo.name,
          thumbnail: courseDetailInfo.thumbnail,
          finalPrice: courseDetailInfo.finalPrice,
          level: courseDetailInfo.level,
          userId: courseDetailInfo.userId,
          authorId: courseDetailInfo.authorId,
          numOfReviews: courseDetailInfo.numOfReviews,
          totalVideosLength: courseDetailInfo.totalVideosLength,
          avgRatingStars: courseDetailInfo.avgRatingStars,
          lessons: courseDetailInfo.lessons,
        };
        result.push(cartItem);
    
    }

    res.status(200).json({
      message: "Fetch cart by course ids list successfully!",
      cart: {
        items: result,
        totalPrice: totalPrice,
      },
      duplicatedIds: duplicatedIds,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to retrieve cart from database", 422);
      return next(customError);
    }
  }
};

export const getTotalPrice = async (req: UserAuthRequest, res: Response, next: NextFunction) => {
  const { courseIds, couponCode } = req.query;
  const { userId } = req;

  try {
    let totalPrice: number = 0;
    let discountPrice: number = 0;
    let courseIdArray = [];

    if (typeof courseIds === "string" && courseIds.length > 0) {
      courseIdArray = courseIds.split(",");
    }

    if (courseIdArray.length > 0) {
      totalPrice = await calculateTotalPrice(courseIdArray);

      if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode });

        if (!coupon) {
          const customError = new CustomErrorMessage(ERROR_NOT_FOUND_DATA, 404);
          return next(customError);
        }

        const usedByArray = coupon.usedBy.map((id) => id.toString());

        if (usedByArray.includes(userId)) {
          const customError = new CustomErrorMessage(ERROR_NOT_FOUND_DATA, 404);
          return next(customError);
        }

        const currentDate = new Date();

        if (coupon.dateStart > currentDate || coupon.dateEnd < currentDate || coupon.isDeleted) {
          const customError = new CustomErrorMessage(ERROR_NOT_FOUND_DATA, 404);
          return next(customError);
        }

        if (coupon.couponTypeId.toString() === COUPON_TYPES.COUPON_TYPE_PERCENT) {
          discountPrice = totalPrice * (coupon.discountAmount / 100);
        } else if (coupon.couponTypeId.toString() === COUPON_TYPES.COUPON_TYPE_FIXED_AMOUNT) {
          discountPrice = coupon.discountAmount;
        }

        totalPrice -= discountPrice;
      }
    }

    totalPrice = Math.max(totalPrice, 0);

    if (Number.isInteger(totalPrice)) {
      totalPrice = Math.floor(totalPrice);
    } else {
      totalPrice = parseFloat(totalPrice.toFixed(2));
    }

    if (Number.isInteger(discountPrice)) {
      discountPrice = Math.floor(discountPrice);
    } else {
      discountPrice = parseFloat(discountPrice.toFixed(2));
    }

    res.status(200).json({
      message: GET_SUCCESS,
      totalPrice: totalPrice,
      discountPrice: discountPrice,
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

export const getTotalPriceWithoutUser = async (req: Request, res: Response, next: NextFunction) => {
  const { courseIds, couponCode } = req.query;

  try {
    let totalPrice: number = 0;
    let discountPrice: number = 0;
    let courseIdArray = [];

    if (typeof courseIds === "string" && courseIds.length > 0) {
      courseIdArray = courseIds.split(",");
    }

    if (courseIdArray.length > 0) {
      totalPrice = await calculateTotalPrice(courseIdArray);

      if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode });

        if (!coupon) {
          const customError = new CustomErrorMessage(ERROR_NOT_FOUND_DATA, 404);
          return next(customError);
        }

        const currentDate = new Date();

        if (coupon.dateStart > currentDate || coupon.dateEnd < currentDate || coupon.isDeleted) {
          const customError = new CustomErrorMessage(ERROR_NOT_FOUND_DATA, 404);
          return next(customError);
        }

        if (coupon.couponTypeId.toString() === COUPON_TYPES.COUPON_TYPE_PERCENT) {
          discountPrice = totalPrice * (coupon.discountAmount / 100);
        } else if (coupon.couponTypeId.toString() === COUPON_TYPES.COUPON_TYPE_FIXED_AMOUNT) {
          discountPrice = coupon.discountAmount;
        }

        totalPrice -= discountPrice;
      }
    }

    totalPrice = Math.max(totalPrice, 0);

    if (Number.isInteger(totalPrice)) {
      totalPrice = Math.floor(totalPrice);
    } else {
      totalPrice = parseFloat(totalPrice.toFixed(2));
    }

    if (Number.isInteger(discountPrice)) {
      discountPrice = Math.floor(discountPrice);
    } else {
      discountPrice = parseFloat(discountPrice.toFixed(2));
    }

    res.status(200).json({
      message: GET_SUCCESS,
      totalPrice: totalPrice,
      discountPrice: discountPrice,
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
