import { Request, Response, NextFunction } from "express";
import Test from "../../models/Test";
import CustomError from "../../utils/error";
import CustomErrorMessage from "../../utils/errorMessage";
import { AuthorAuthRequest } from "../../middleware/is-auth";
import { CREATE_SUCCESS, ERROR_CREATE_DATA, ERROR_GET_DATA, ERROR_GET_DATA_DETAIL, ERROR_GET_DATA_HISTORIES, ERROR_NOT_FOUND_DATA, ERROR_UPDATE_ACTIVE_DATA, ERROR_UPDATE_DATA, GET_DETAIL_SUCCESS, GET_HISOTIES_SUCCESS, GET_SUCCESS, UPDATE_ACTIVE_SUCCESS, UPDATE_SUCCESS } from "../../config/constant";
import mongoose, { ClientSession } from "mongoose";
import { coreHelper } from "../../utils/coreHelper";
import ActionLog from "../../models/ActionLog";
import { enumData } from "../../config/enumData";


export const getTests = async (req: Request, res: Response, next: NextFunction) => {
  const queryCondition = {
    isDeleted: false
  }

  try {
    const [results, count] = await Promise.all([
      Test.find(queryCondition).sort({ createdAt: -1 }),
      Test.countDocuments(queryCondition)
    ]);
    res.status(200).json({
      message: GET_SUCCESS,
      results: results,
      count
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

export const getTestById = async (req: Request, res: Response, next: NextFunction) => {
  const { testId } = req.params;

  try {
    const test = await Test.findById(testId);

    if(!test){
      const error = new CustomError("Test", ERROR_NOT_FOUND_DATA, 404);
      throw error;
    }

    res.status(200).json({
      message: GET_DETAIL_SUCCESS,
      test,
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

/** Create Test Function! */
export const postTest = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const { courseId, name, dateStart, dateEnd, timeLimitTest, listUserId, numberCorrectAnswersToPass} = req.body;
  let session: ClientSession | null = null;
  session = await mongoose.startSession();
  session.startTransaction();
  try {
    const testCode = await coreHelper.getCodeDefault('TEST', Test);
    const test = new Test({
      name,
      code: testCode,
      courseId,
      dateStart,
      dateEnd,
      timeLimitTest,
      listUserId,
      numberCorrectAnswersToPass,
      createdBy: req.userId,
      status: enumData.TestStatus.NEW.code
    });

    const testRes = await test.save();
    
    const historyItem = new ActionLog({
      testId: testRes._id,
      type: enumData.ActionLogEnType.Create.code,
      createdBy: new mongoose.Types.ObjectId((req as any).userId) as any,
      functionType: "TEST",
      description: `User [${(req as any).username}] has [${enumData.ActionLogEnType.Create.name}] Test`
    })

    await ActionLog.collection.insertOne(historyItem.toObject(), { 
      session: session 
  });

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

/** Update Test Function! */
export const updateTest = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const { courseId, name, dateStart, dateEnd, timeLimitTest, listUserId, numberCorrectAnswersToPass, id} = req.body;

  let session: ClientSession | null = null;
  session = await mongoose.startSession();
  session.startTransaction();
  try {

    const foundTest = await Test.findById(id);

    if(!foundTest){
      const error = new CustomError("Test", ERROR_NOT_FOUND_DATA, 404);
      throw error;
    }

    foundTest.name = name;
    foundTest.courseId = courseId;
    foundTest.dateStart = dateStart;
    foundTest.dateEnd = dateEnd;
    foundTest.timeLimitTest = timeLimitTest;
    foundTest.listUserId = listUserId;
    foundTest.numberCorrectAnswersToPass = numberCorrectAnswersToPass;
    foundTest.updatedAt = new Date()
    foundTest.updatedBy = new mongoose.Types.ObjectId(req.userId) as any

    const testRes = await foundTest.save();
    
    const historyItem = new ActionLog({
      testId: testRes._id,
      type: enumData.ActionLogEnType.Update.code,
      createdBy: new mongoose.Types.ObjectId((req as any).userId) as any,
      functionType: "TEST",
      description: `User [${(req as any).username}] has [${enumData.ActionLogEnType.Update.name}] Test`
    })

    await ActionLog.collection.insertOne(historyItem.toObject(), { 
      session: session 
  });

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

/** Update Active Status Test Function! */
export const updateActiveStatusTest = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const {id } = req.body;
  let session: ClientSession | null = null;
  session = await mongoose.startSession();
  session.startTransaction();
  try {

    const foundTest = await Test.findById(id);
    if(!foundTest){
      const error = new CustomError("Test", ERROR_NOT_FOUND_DATA, 404);
      throw error;
    }

    foundTest.isDeleted = !foundTest.isDeleted
    foundTest.updatedAt = new Date()
    foundTest.updatedBy = new mongoose.Types.ObjectId(req.userId) as any

    const testRes = await foundTest.save();
    const type = foundTest.isDeleted === false ? `${enumData.ActionLogEnType.Activate.code}` : `${enumData.ActionLogEnType.Deactivate.code}`
    const typeName = foundTest.isDeleted === false ? `${enumData.ActionLogEnType.Activate.name}` : `${enumData.ActionLogEnType.Deactivate.name}`
    const createdBy = new mongoose.Types.ObjectId(req.userId) as any
    const historyDesc = `User [${(req as any).username}] has [${typeName}] Test`
    const functionType = "TEST"
    const historyItem = new ActionLog({
      testId: testRes._id,
      type,
      createdBy,
      functionType,
      description: historyDesc
    })

    await ActionLog.collection.insertOne(historyItem.toObject(), { 
      session: session 
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


export const loadHistories = async (req: Request, res: Response, next: NextFunction) => {
  const { testId } = req.params;

  try {
    const [results, count] = await Promise.all([
      ActionLog.find({ testId: testId }).sort({ createdAt: -1 }),
      ActionLog.countDocuments({ testId: testId })
    ]);
    res.status(200).json({
      message: GET_HISOTIES_SUCCESS,
      results,
      count
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