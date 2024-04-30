import { Request, Response, NextFunction } from "express";
import Course from "../../models/Course";
import ActionLog from "../../models/ActionLog";
import { ICourse } from "../../types/course.type";
import Order from "../../models/Order";
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

    // Get the number of learners for each course
    const coursesWithLearners = await Promise.all(
      courses.map(async (course) => {
        const learnersCount = await Order.find({
          items: { $elemMatch: { _id: course._id } },
          status: "Success"
        }).countDocuments();
        return {
          ...course.toObject(),
          learners: learnersCount,
        };
      })
    );

    const totalCourses: number = await Course.where(query).countDocuments();

    const pagination = {
      _page: +_page || 1,
      _limit: +_limit || 8,
      _totalRows: totalCourses,
    };

    res.status(200).json({
      message: "Fetch all courses successfully!",
      courses: coursesWithLearners,
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
    courseSlug,
    willLearns,
    subTitle,
    views,
    tags,
    requirements,
    coursePreview,
  } = req.body;

  let session: ClientSession | null = null;

  session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (price < 0 || finalPrice < 0 || views < 0) {
      const customError = new CustomErrorMessage(ERROR_CREATE_DATA, 400);
      return next(customError);
    }

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
      userId: req.userId,
      courseSlug,
      categoryId,
      willLearns,
      subTitle,
      tags,
      views,
      requirements,
      coursePreview,
      createdBy: req.userId,
    });

    const courseRes = await course.save();

    const historyItem = new ActionLog({
      courseId: courseRes._id,
      type: enumData.ActionLogEnType.Create.code,
      createdBy: new mongoose.Types.ObjectId(req.userId),
      functionType: "COURSE",
      description: `User [${req.username}] has [${enumData.ActionLogEnType.Create.name}] Course`,
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

export const updateCourse = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const {
    name,
    thumbnail,
    access,
    price,
    finalPrice,
    description,
    level,
    categoryId,
    courseSlug,
    willLearns,
    subTitle,
    views,
    tags,
    requirements,
    _id,
  } = req.body;
  let session: ClientSession | null = null;

  session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (price < 0 || finalPrice < 0 || views < 0) {
      const customError = new CustomErrorMessage(ERROR_UPDATE_DATA, 400);
      return next(customError);
    }

    const foundCourse = await Course.findById(_id);

    if (!foundCourse) {
      const error = new CustomError("Course", ERROR_NOT_FOUND_DATA, 404);
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
    foundCourse.courseSlug = courseSlug;
    foundCourse.willLearns = willLearns;
    foundCourse.subTitle = subTitle;
    foundCourse.views = views;
    foundCourse.tags = tags;
    foundCourse.requirements = requirements;
    foundCourse.updatedAt = new Date();
    foundCourse.updatedBy = new mongoose.Types.ObjectId(req.userId) as any;

    const courseRes = await foundCourse.save();

    const historyItem = new ActionLog({
      courseId: courseRes._id,
      type: enumData.ActionLogEnType.Update.code,
      createdBy: new mongoose.Types.ObjectId(req.userId) as any,
      functionType: "COURSE",
      description: `User [${req.username}] has [${enumData.ActionLogEnType.Update.name}] Course`,
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

export const loadHistoriesForCourse = async (req: Request, res: Response, next: NextFunction) => {
  const { courseId } = req.params;

  try {
    const page = parseInt(req.query._page as string) || 1;
    const limit = parseInt(req.query._limit as string) || 10;
    const skip = (page - 1) * limit;

    const [results, count] = await Promise.all([
      ActionLog.find({ courseId: courseId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ActionLog.countDocuments({ courseId: courseId }),
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
