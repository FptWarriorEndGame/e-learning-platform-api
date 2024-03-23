import { Request, Response, NextFunction } from "express";
import Coupon from "../../models/Coupon";
import CouponCourse from "../../models/CouponCourse";
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

export const getCoupons = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  try {
    const searchTerm = (req.query._q as string) || "";
    const page = parseInt(req.query._page as string) || 1;
    const limit = parseInt(req.query._limit as string) || 10;
    const skip = (page - 1) * limit;

    const statusFilter = (req.query._status as string) || "all";

    let query: any = {
      ...(statusFilter === "active" ? { isDeleted: false } : {}),
      ...(statusFilter === "inactive" ? { isDeleted: true } : {}),
      ...(searchTerm ? { description: { $regex: searchTerm, $options: "i" } } : {}),
    };
    const currentUserRole = req.role;
    if (currentUserRole && currentUserRole === enumData.UserType.Author.code) {
      query.createdBy = new mongoose.Types.ObjectId(req.userId) as any;
    }

    const total = await Coupon.countDocuments(query);

    const coupons = await Coupon.find(query)
      .populate("couponTypeId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: GET_SUCCESS,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
      coupons,
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

export const getCouponById = async (req: Request, res: Response, next: NextFunction) => {
  const { couponId } = req.params;

  try {
    const coupon = await Coupon.findOne({ _id: couponId })
      .populate("createdBy", "name")
      .populate("updatedBy", "name")
      .populate("couponTypeId", "name");

    if (!coupon) {
      const error = new CustomError("Coupon", ERROR_NOT_FOUND_DATA, 404);
      throw error;
    }

    const couponCourses = await CouponCourse.find({
      couponId: coupon._id,
      isDeleted: false,
    }).populate("courseId", "name thumbnail");

    res.status(200).json({
      message: GET_DETAIL_SUCCESS,
      coupon,
      couponCourses,
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

export const postCoupon = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const { description, discountAmount, couponTypeId, dateStart, dateEnd, courseIds } = req.body;
  let session: ClientSession | null = null;

  session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (discountAmount < 0) {
      const customError = new CustomErrorMessage(ERROR_CREATE_DATA, 400);
      return next(customError);
    }

    const couponCode = await coreHelper.getCodeDefault("COUPON", Coupon);

    const coupon = new Coupon({
      code: couponCode,
      description,
      discountAmount,
      couponTypeId,
      dateStart,
      dateEnd,
      createdBy: req.userId,
    });

    const couponRes = await coupon.save();

    const couponCoursePromises = courseIds.map(async (courseId: string) => {
      const code = await coreHelper.getCodeDefault("COUPON_COURSE", CouponCourse);
      const couponCourse = new CouponCourse({
        code,
        couponId: couponRes._id,
        courseId,
      });
      return couponCourse.save();
    });

    await Promise.all(couponCoursePromises);

    const historyItem = new ActionLog({
      couponId: couponRes._id,
      type: enumData.ActionLogEnType.Create.code,
      createdBy: new mongoose.Types.ObjectId(req.userId),
      functionType: "COUPON",
      description: `User [${req.username}] has [${enumData.ActionLogEnType.Create.name}] Coupon`,
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

export const updateCoupon = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const { code, description, discountAmount, couponTypeId, dateStart, dateEnd, _id, courseIds } =
    req.body;
  let session: ClientSession | null = null;

  session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (discountAmount < 0) {
      const customError = new CustomErrorMessage(ERROR_CREATE_DATA, 400);
      return next(customError);
    }

    const foundCoupon = await Coupon.findById(_id);

    if (!foundCoupon) {
      const error = new CustomError("Coupon", ERROR_NOT_FOUND_DATA, 404);
      throw error;
    }

    foundCoupon.code = code;
    foundCoupon.description = description;
    foundCoupon.discountAmount = discountAmount;
    foundCoupon.couponTypeId = couponTypeId;
    foundCoupon.dateStart = dateStart;
    foundCoupon.dateEnd = dateEnd;
    foundCoupon.updatedAt = new Date();
    foundCoupon.updatedBy = new mongoose.Types.ObjectId(req.userId) as any;

    const couponRes = await foundCoupon.save();

    const existingCouponCourses = await CouponCourse.find({
      couponId: couponRes._id,
    });

    const activeExistingCouponCourses = existingCouponCourses.filter(
      (couponCourse) => !couponCourse.isDeleted
    );

    const activeExistingCourseIds = activeExistingCouponCourses.map((couponCourse) =>
      couponCourse.courseId.toString()
    );

    const isCourseListChanged =
      courseIds.some((courseId) => !activeExistingCourseIds.includes(courseId)) ||
      activeExistingCourseIds.some((courseId) => !courseIds.includes(courseId));

    if (isCourseListChanged) {
      for (const couponCourse of existingCouponCourses) {
        if (!courseIds.includes(couponCourse.courseId.toString())) {
          couponCourse.isDeleted = true;
          await couponCourse.save({ session });
        } else if (couponCourse.isDeleted) {
          couponCourse.isDeleted = false;
          await couponCourse.save({ session });
        }
      }

      const existingCourseIds = existingCouponCourses.map((course) => course.courseId.toString());
      const coursesToAdd = courseIds.filter((courseId) => !existingCourseIds.includes(courseId));

      for (const courseId of coursesToAdd) {
        const code = await coreHelper.getCodeDefault("COUPON_COURSE", CouponCourse);
        const couponCourse = new CouponCourse({
          code,
          couponId: couponRes._id,
          courseId,
        });
        await couponCourse.save({ session });
      }
    }

    const historyItem = new ActionLog({
      couponId: couponRes._id,
      type: enumData.ActionLogEnType.Update.code,
      createdBy: new mongoose.Types.ObjectId(req.userId) as any,
      functionType: "COUPON",
      description: `User [${req.username}] has [${enumData.ActionLogEnType.Update.name}] Coupon`,
    });

    await ActionLog.collection.insertOne(historyItem.toObject(), { session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: UPDATE_SUCCESS,
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage(ERROR_UPDATE_DATA, 422);
      return next(customError);
    }
  }
};

export const updateActiveStatusCoupon = async (
  req: AuthorAuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { couponId } = req.body;

  let session: ClientSession | null = null;
  session = await mongoose.startSession();
  session.startTransaction();

  try {
    const foundCoupon = await Coupon.findById(couponId);

    if (!foundCoupon) {
      const error = new CustomError("Coupon", ERROR_NOT_FOUND_DATA, 404);
      throw error;
    }

    foundCoupon.isDeleted = !foundCoupon.isDeleted;
    foundCoupon.updatedAt = new Date();
    foundCoupon.updatedBy = new mongoose.Types.ObjectId(req.userId) as any;

    const couponRes = await foundCoupon.save();

    const type =
      foundCoupon.isDeleted === false
        ? `${enumData.ActionLogEnType.Activate.code}`
        : `${enumData.ActionLogEnType.Deactivate.code}`;
    const typeName =
      foundCoupon.isDeleted === false
        ? `${enumData.ActionLogEnType.Activate.name}`
        : `${enumData.ActionLogEnType.Deactivate.name}`;
    const createdBy = new mongoose.Types.ObjectId(req.userId) as any;
    const historyDesc = `User [${req.username}] has [${typeName}] Coupon`;
    const functionType = "COUPON";

    const historyItem = new ActionLog({
      couponId: couponRes._id,
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

export const loadHistoriesForCoupon = async (req: Request, res: Response, next: NextFunction) => {
  const { couponId } = req.params;

  try {
    const page = parseInt(req.query._page as string) || 1;
    const limit = parseInt(req.query._limit as string) || 10;
    const skip = (page - 1) * limit;

    const [results, count] = await Promise.all([
      ActionLog.find({ couponId: couponId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ActionLog.countDocuments({ couponId: couponId }),
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
