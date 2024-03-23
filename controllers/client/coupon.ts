import { Request, Response, NextFunction } from "express";
import Coupon from "../../models/Coupon";
import Course from "../../models/Course";
import CouponCourse from "../../models/CouponCourse";
import CustomError from "../../utils/error";
import { calculateTotalPrice, getMaxDiscountCoupon } from "../../utils/helper";
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

export const getValidCouponsForCourses = async (
  req: UserAuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { courseIds } = req.query;
  const { userId } = req;

  const currentDate = new Date();

  try {
    let courseIdArray = [];

    if (typeof courseIds === "string" && courseIds.length > 0) {
      courseIdArray = courseIds.split(",");
    }

    let validCoupons = null;
    let maxDiscountCoupon = null;

    if (courseIdArray.length > 0) {
      const totalPrice = await calculateTotalPrice(courseIdArray);

      const couponCourses = await CouponCourse.find({ courseId: { $in: courseIdArray } }).select(
        "couponId"
      );

      const couponIds = couponCourses.map((couponCourse) => couponCourse.couponId);

      validCoupons = await Coupon.find({
        _id: { $in: couponIds },
        usedBy: { $nin: [userId] },
        dateStart: { $lte: currentDate },
        dateEnd: { $gte: currentDate },
        isDeleted: false,
      });

      maxDiscountCoupon = getMaxDiscountCoupon(totalPrice, validCoupons);
    }

    res.status(200).json({
      message: GET_SUCCESS,
      coupons: validCoupons,
      maxDiscountCoupon: maxDiscountCoupon,
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

export const getValidCouponsForCoursesWithoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { courseIds } = req.query;
  const currentDate = new Date();

  try {
    let courseIdArray = [];

    if (typeof courseIds === "string" && courseIds.length > 0) {
      courseIdArray = courseIds.split(",");
    }

    let validCoupons = null;
    let maxDiscountCoupon = null;

    if (courseIdArray.length > 0) {
      const totalPrice = await calculateTotalPrice(courseIdArray);

      const couponCourses = await CouponCourse.find({ courseId: { $in: courseIdArray } }).select(
        "couponId"
      );

      const couponIds = couponCourses.map((couponCourse) => couponCourse.couponId);

      validCoupons = await Coupon.find({
        _id: { $in: couponIds },
        dateStart: { $lte: currentDate },
        dateEnd: { $gte: currentDate },
        isDeleted: false,
      });

      maxDiscountCoupon = getMaxDiscountCoupon(totalPrice, validCoupons);
    }

    res.status(200).json({
      message: GET_SUCCESS,
      coupons: validCoupons,
      maxDiscountCoupon: maxDiscountCoupon,
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
