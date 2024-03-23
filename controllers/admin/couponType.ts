import { Request, Response, NextFunction } from "express";
import CouponType from "../../models/CouponType";
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

export const getCouponTypes = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
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
    if(currentUserRole && currentUserRole === enumData.UserType.Author.code) {
      query.createdBy = new mongoose.Types.ObjectId(req.userId) as any;
   }

    const total = await CouponType.countDocuments(query);

    const couponTypes = await CouponType.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: GET_SUCCESS,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
      couponTypes,
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

export const getAllActiveCouponTypes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const couponTypes = await CouponType.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.status(200).json({
      message: GET_SUCCESS,
      couponTypes,
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

export const getCouponTypeById = async (req: Request, res: Response, next: NextFunction) => {
  const { couponTypeId } = req.params;

  try {
    const couponType = await CouponType.findOne({ _id: couponTypeId })
      .populate("createdBy", "name")
      .populate("updatedBy", "name");

    if (!couponType) {
      const error = new CustomError("CouponType", ERROR_NOT_FOUND_DATA, 404);
      throw error;
    }

    res.status(200).json({
      message: GET_DETAIL_SUCCESS,
      couponType,
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

export const postCouponType = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const { name, description } = req.body;
  let session: ClientSession | null = null;

  session = await mongoose.startSession();
  session.startTransaction();

  try {
    const couponTypeCode = await coreHelper.getCodeDefault("COUPON_TYPE", CouponType);

    const couponType = new CouponType({
      name,
      description,
      code: couponTypeCode,
      createdBy: req.userId,
    });

    const couponTypeRes = await couponType.save();

    const historyItem = new ActionLog({
      couponTypeId: couponTypeRes._id,
      type: enumData.ActionLogEnType.Create.code,
      createdBy: new mongoose.Types.ObjectId(req.userId),
      functionType: "COUPON_TYPE",
      description: `User [${req.username}] has [${enumData.ActionLogEnType.Create.name}] Coupon Type`,
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

export const updateCouponType = async (
  req: AuthorAuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { name, description, _id } = req.body;
  let session: ClientSession | null = null;

  session = await mongoose.startSession();
  session.startTransaction();

  try {
    const foundCouponType = await CouponType.findById(_id);

    if (!foundCouponType) {
      const error = new CustomError("CouponType", ERROR_NOT_FOUND_DATA, 404);
      throw error;
    }

    foundCouponType.name = name;
    foundCouponType.description = description;
    foundCouponType.updatedAt = new Date();
    foundCouponType.updatedBy = new mongoose.Types.ObjectId(req.userId) as any;

    const couponTypeRes = await foundCouponType.save();

    const historyItem = new ActionLog({
      couponTypeId: couponTypeRes._id,
      type: enumData.ActionLogEnType.Update.code,
      createdBy: new mongoose.Types.ObjectId(req.userId) as any,
      functionType: "COUPON_TYPE",
      description: `User [${req.username}] has [${enumData.ActionLogEnType.Update.name}] Coupon Type`,
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

export const updateActiveStatusCouponType = async (
  req: AuthorAuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { couponTypeId } = req.body;

  let session: ClientSession | null = null;
  session = await mongoose.startSession();
  session.startTransaction();

  try {
    const foundCouponType = await CouponType.findById(couponTypeId);

    if (!foundCouponType) {
      const error = new CustomError("CouponType", ERROR_NOT_FOUND_DATA, 404);
      throw error;
    }

    foundCouponType.isDeleted = !foundCouponType.isDeleted;
    foundCouponType.updatedAt = new Date();
    foundCouponType.updatedBy = new mongoose.Types.ObjectId(req.userId) as any;

    const couponTypeRes = await foundCouponType.save();

    const type =
      foundCouponType.isDeleted === false
        ? `${enumData.ActionLogEnType.Activate.code}`
        : `${enumData.ActionLogEnType.Deactivate.code}`;
    const typeName =
      foundCouponType.isDeleted === false
        ? `${enumData.ActionLogEnType.Activate.name}`
        : `${enumData.ActionLogEnType.Deactivate.name}`;
    const createdBy = new mongoose.Types.ObjectId(req.userId) as any;
    const historyDesc = `User [${req.username}] has [${typeName}] CouponType`;
    const functionType = "COUPON_TYPE";

    const historyItem = new ActionLog({
      couponTypeId: couponTypeRes._id,
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

export const loadHistoriesForCouponType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { couponTypeId } = req.params;

  try {
    const page = parseInt(req.query._page as string) || 1;
    const limit = parseInt(req.query._limit as string) || 10;
    const skip = (page - 1) * limit;

    const [results, count] = await Promise.all([
      ActionLog.find({ couponTypeId: couponTypeId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ActionLog.countDocuments({ couponTypeId: couponTypeId }),
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
