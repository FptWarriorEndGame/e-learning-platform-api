import { Request, Response, NextFunction } from "express";
import Course from "../../models/Course";
import ActionLog from "../../models/ActionLog";
import { ICourse } from "../../types/course.type";
import CustomError from "../../utils/error";
import CustomErrorMessage from "../../utils/errorMessage";
import { enumData } from "../../config/enumData";
import mongoose, { Types, ObjectId, ClientSession, Mongoose } from "mongoose";
import { AuthorAuthRequest } from "../../middleware/is-auth";
import { coreHelper } from "../../utils/coreHelper";
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
interface GetCoursesQuery {
  $text?: { $search: string };
  userId?: { $in: string[] };
  username?: string;
  categoryId?: string;
  createdBy?: ObjectId;
}

export const getCourses = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const { _q, _page, _limit, _author, _category } = req.query;

  const skip: number = ((+_page || 1) - 1) * +_limit;

  const query: GetCoursesQuery = {};

  if (_q && typeof _q === "string") {
    query.$text = { $search: _q };
  }

  if (_author && typeof _author === "string" && _author !== "all") {
    query.userId = {
      $in: _author.split(","),
    };
  }

  if (_category && typeof _category === "string" && _category !== "all") {
    query.categoryId = _category;
  }

  // Filter data by author (who has created that course)
  // if(req.username !== "admin") {
  //   query.createdBy = new mongoose.Types.ObjectId(req.userId) as any;
  // }

  try {
    const promiseCourses = Course.find(query, {
      ...(query.$text && { score: { $meta: "textScore" } }),
    })
      .populate("categoryId", "_id name")
      .populate("userId", "_id name avatar")
      .sort({ createdAt: -1 });

    let courses: ICourse[];

    if (_limit && _page) {
      courses = await promiseCourses.skip(skip).limit(+_limit);
    } else {
      courses = await promiseCourses;
    }

    const totalCourses: number = await Course.where(query).countDocuments();

    const pagination = {
      _page: +_page || 1,
      _limit: +_limit || 8,
      _totalRows: totalCourses,
    };

    res.status(200).json({
      message: "Fetch all courses successfully!",
      courses,
      pagination,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch courses!", 422);
      return next(customError);
    }
  }
};

export const getAllActiveCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courses = await Course.find({ isDeleted: false }).sort({ createdAt: -1 });

    res.status(200).json({
      message: GET_SUCCESS,
      courses,
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

export const getAllCourses = async (req: Request, res: Response, next: NextFunction) => {
  const _q: string = req.query._q as string;

  const query: GetCoursesQuery = {};

  if (_q) {
    query.$text = { $search: _q };
  }

  try {
    const courses = await Course.find(query, {
      ...(query.$text && { score: { $meta: "textScore" } }),
    })
      .populate("categoryId", "_id name")
      .populate("userId", "_id name avatar");

    res.status(200).json({
      message: "Fetch all Courses successfully!",
      courses,
      pagination: {
        _totalRows: courses.length,
      },
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch all courses!", 422);
      return next(customError);
    }
  }
};

export const getCourse = async (req: Request, res: Response, next: NextFunction) => {
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId)
      .populate("categoryId", "_id name")
      .populate("userId", "_id name");

    res.status(200).json({
      message: "Fetch single course successfully!",
      course,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch course by id!", 422);
      return next(customError);
    }
  }
};

export const postCourse = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const {
    name,
    thumbnail,
    access,
    price,
    finalPrice,
    description,
    level,
    categoryId,
    userId,
    courseSlug,
    willLearns,
    subTitle,
  } = req.body;
  // Create transaction to make sure data intergrity
  let session: ClientSession | null = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const courseCode = await coreHelper.getCodeDefault("COURSE", Course);

    const course = new Course({
      code: courseCode,
      name,
      thumbnail,
      access,
      price,
      finalPrice,
      description,
      level,
      courseSlug,
      categoryId,
      userId,
      willLearns,
      subTitle,
      createdBy: req.userId,
    });

    const courseRes = await course.save({
      session: session,
    });

    const historyItem = new ActionLog({
      courseId: courseRes._id,
      type: enumData.ActionLogEnType.Create.code,
      createdBy: new mongoose.Types.ObjectId((req as any).userId) as any,
      functionType: "COURSE",
      description: `User [${(req as any).username}] has [${
        enumData.ActionLogEnType.Create.name
      }] Course`,
    });

    await historyItem.save({
      session: session,
    });

    await session.commitTransaction();
    session.endSession();
    res.json({
      message: "Create course successfully!",
      course: courseRes,
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to create courses!", 422);
      return next(customError);
    }
  }
};

export const udpateCourse = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const {
    id,
    name,
    thumbnail,
    access,
    price,
    finalPrice,
    description,
    level,
    categoryId,
    userId,
    courseSlug,
    willLearns,
    subTitle,
  } = req.body;
  // Create transaction to make sure data intergrity
  let session: ClientSession | null = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const foundCourse = await Course.findById(id);
    if (!foundCourse) {
      const error = new CustomError("Course", "Course not found", 404);
      throw error;
    }
    foundCourse.name = name;
    foundCourse.thumbnail = thumbnail;
    foundCourse.access = access;
    foundCourse.price = price;
    foundCourse.finalPrice = finalPrice;
    foundCourse.description = description;
    foundCourse.level = level;
    foundCourse.categoryId = categoryId;
    foundCourse.userId = userId;
    foundCourse.courseSlug = courseSlug;
    foundCourse.willLearns = willLearns;
    foundCourse.subTitle = subTitle;

    const courseRes = await foundCourse.save({
      session: session,
    });
    const courseId = courseRes._id;
    const type = enumData.ActionLogEnType.Update.code;
    const createdBy = new mongoose.Types.ObjectId(req.userId) as any;
    const historyDesc = ` User [${(req as any).username}] has [${
      enumData.ActionLogEnType.Update.name
    }] Course`;
    const functionType = "COURSE";
    const historyItem = new ActionLog({
      courseId,
      type,
      createdBy,
      functionType,
      description: historyDesc,
    });

    await historyItem.save({
      session: session,
    });

    await session.commitTransaction();
    session.endSession();
    res.json({
      message: "Update course successfully!",
      course: courseRes,
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to update courses!", 422);
      return next(customError);
    }
  }
};

export const updateActiveStatusCourse = async (
  req: AuthorAuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { courseId } = req.body;

  let session: ClientSession | null = null;
  session = await mongoose.startSession();
  session.startTransaction();

  try {
    const foundCourse = await Course.findById(courseId);

    if (!foundCourse) {
      const error = new CustomError("Course", ERROR_NOT_FOUND_DATA, 404);
      throw error;
    }

    foundCourse.isDeleted = !foundCourse.isDeleted;
    foundCourse.updatedAt = new Date();
    foundCourse.updatedBy = new mongoose.Types.ObjectId(req.userId) as any;

    const courseRes = await foundCourse.save();

    const type =
      foundCourse.isDeleted === false
        ? `${enumData.ActionLogEnType.Activate.code}`
        : `${enumData.ActionLogEnType.Deactivate.code}`;
    const typeName =
      foundCourse.isDeleted === false
        ? `${enumData.ActionLogEnType.Activate.name}`
        : `${enumData.ActionLogEnType.Deactivate.name}`;
    const createdBy = new mongoose.Types.ObjectId(req.userId) as any;
    const historyDesc = `User [${req.username}] has [${typeName}]  Course`;
    const functionType = "COURSE";

    const historyItem = new ActionLog({
      courseId: courseRes._id,
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

export const loadHistories = async (req: Request, res: Response, next: NextFunction) => {
  const { courseId } = req.params;

  try {
    const [results, count] = await Promise.all([
      ActionLog.find({ courseId: courseId }).sort({ createdAt: -1 }),
      ActionLog.countDocuments({ courseId: courseId }),
    ]);
    res.status(200).json({
      message: "Fetch list histories successfully!",
      results,
      count,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch question by id!", 422);
      return next(customError);
    }
  }
};
