import { Request, Response, NextFunction } from "express";
import Feedback from "../../models/Feedback";
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

export const createFeedback = async (req: Request, res: Response, next: NextFunction) => {
  const userId = "65f3c73a6133d2c1da17fb44";
  const username = "guest123";

  const { name, email, message } = req.body;

  let session: ClientSession | null = null;

  session = await mongoose.startSession();
  session.startTransaction();

  try {
    const feedbackCode = await coreHelper.getCodeDefault("FEEDBACK", Feedback);

    const feedback = new Feedback({
      code: feedbackCode,
      name,
      email,
      message,
      createdBy: userId,
    });

    const feedbackRes = await feedback.save();

    const historyItem = new ActionLog({
      feedbackId: feedbackRes._id,
      type: enumData.ActionLogEnType.Create.code,
      createdBy: new mongoose.Types.ObjectId(userId),
      functionType: "FEEDBACK",
      description: `User [${username}] has [${enumData.ActionLogEnType.Create.name}] Feedback`,
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
