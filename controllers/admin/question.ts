import { Request, Response, NextFunction, response } from "express";
import Question from "../../models/Question";
import CustomError from "../../utils/error";
import CustomErrorMessage from "../../utils/errorMessage";
import mongoose, {Types, ObjectId, ClientSession} from "mongoose";
import { coreHelper } from "../../utils/coreHelper";
import ActionLog from "../../models/ActionLog";
import { enumData } from "../../config/enumData";
import { AuthorAuthRequest } from "../../middleware/is-auth";
import { CREATE_SUCCESS, ERROR_CREATE_DATA, ERROR_GET_DATA, ERROR_GET_DATA_DETAIL, ERROR_GET_DATA_HISTORIES, ERROR_NOT_FOUND_DATA, ERROR_UPDATE_ACTIVE_DATA, ERROR_UPDATE_DATA, GET_DETAIL_SUCCESS, GET_HISOTIES_SUCCESS, GET_SUCCESS, UPDATE_ACTIVE_SUCCESS, UPDATE_SUCCESS } from "../../config/constant";

export const getQuestions = async (req: Request, res: Response, next: NextFunction) => {

  const queryCondition = {
    isDeleted: false,
    // createdBy: (req as any).userId
  }

  try {
    const [results, count] = await Promise.all([
      Question.find(queryCondition).sort({ createdAt: -1 }),
      Question.countDocuments(queryCondition)
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

export const getQuestionById = async (req: Request, res: Response, next: NextFunction) => {
  const { questionId } = req.params;

  try {
    const question = await Question.findById(questionId);

    if(!question){
      const error = new CustomError("Question", ERROR_NOT_FOUND_DATA, 404);
      throw error;
    }
      
    res.status(200).json({
      message: GET_DETAIL_SUCCESS,
      question,
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

/** Create Question Function! */
export const postQuestion = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const { name, listAnswersOfQuestion, correctAnswer } = req.body;
  let session: ClientSession | null = null;
  session = await mongoose.startSession();
  session.startTransaction();
  try {
    const questionCode = await coreHelper.getCodeDefault('QUESTION', Question);
    const question = new Question({
      name,
      code: questionCode,
      listAnswersOfQuestion: listAnswersOfQuestion,
      correctAnswer: correctAnswer,
      createdBy: req.userId
    });

    const questionRes = await question.save();
    
    const historyItem = new ActionLog({
      questionId: questionRes._id,
      type: enumData.ActionLogEnType.Create.code,
      createdBy: new mongoose.Types.ObjectId((req as any).userId) as any,
      functionType: "QUESTION",
      description: `User [${(req as any).username}] has [${enumData.ActionLogEnType.Create.name}] Question`
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

/** Update Question Function! */
export const updateQuestion = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const { name, listAnswersOfQuestion, correctAnswer, id } = req.body;
  let session: ClientSession | null = null;
  session = await mongoose.startSession();
  session.startTransaction();
  try {

    const foundQuestion = await Question.findById(id);

    if(!foundQuestion){
      const error = new CustomError("Question", ERROR_NOT_FOUND_DATA, 404);
      throw error;
    }

    foundQuestion.name = name;
    foundQuestion.listAnswersOfQuestion = listAnswersOfQuestion;
    foundQuestion.correctAnswer = correctAnswer;
    foundQuestion.updatedAt = new Date()
    foundQuestion.updatedBy = new mongoose.Types.ObjectId(req.userId) as any

    const questionRes = await foundQuestion.save();
    
    const historyItem = new ActionLog({
      questionId: questionRes._id,
      type: enumData.ActionLogEnType.Update.code,
      createdBy: new mongoose.Types.ObjectId((req as any).userId) as any,
      functionType: "QUESTION",
      description: `User [${(req as any).username}] has [${enumData.ActionLogEnType.Update.name}] Question`
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

/** Update Active Status Question Function! */
export const updateActiveStatusQuestion = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const {id } = req.body;
  let session: ClientSession | null = null;
  session = await mongoose.startSession();
  session.startTransaction();
  try {

    const foundQuestion = await Question.findById(id);
    if(!foundQuestion){
      const error = new CustomError("Question", ERROR_NOT_FOUND_DATA, 404);
      throw error;
    }

    foundQuestion.isDeleted = !foundQuestion.isDeleted
    foundQuestion.updatedAt = new Date()
    foundQuestion.updatedBy = new mongoose.Types.ObjectId(req.userId) as any

    const questionRes = await foundQuestion.save();
    const type = foundQuestion.isDeleted === false ? `${enumData.ActionLogEnType.Activate.code}` : `${enumData.ActionLogEnType.Deactivate.code}`
    const typeName = foundQuestion.isDeleted === false ? `${enumData.ActionLogEnType.Activate.name}` : `${enumData.ActionLogEnType.Deactivate.name}`
    const createdBy = new mongoose.Types.ObjectId(req.userId) as any
    const historyDesc = `User [${(req as any).username}] has [${typeName}] Question`
    const functionType = "QUESTION"
    const historyItem = new ActionLog({
      questionId: questionRes._id,
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
  const { questionId } = req.params;

  try {
    const [results, count] = await Promise.all([
      ActionLog.find({ questionId: questionId }).sort({ createdAt: -1 }),
      ActionLog.countDocuments({ questionId: questionId })
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