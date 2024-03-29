import { Request, Response, NextFunction } from "express";
import Lesson from "../../models/Lesson";
import Section from "../../models/Section";
import IsLessonDone from "../../models/IsLessonDone";
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

export const getLessonsBySectionId = async (req: Request, res: Response, next: NextFunction) => {
  const { sectionId } = req.params;

  try {
    const lessonsOfSection = await Lesson.find({
      sectionId: sectionId,
    });
    res.status(200).json({
      message: "Fetch all lessons of section id successfully!",
      lessons: lessonsOfSection,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch sections by course id!", 422);
      return next(customError);
    }
  }
};

export const getAllLessons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lessons = await Lesson.find();
    res.status(200).json({ lessons });
  } catch (error) {
    next(error);
  }
};

export const getLessonsBySectionIdEnrolledCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { sectionId } = req.params;
  const userId = req.get("userId");
  try {
    const lessonsOfSection = await Lesson.find({
      sectionId: sectionId,
    });

    const result = lessonsOfSection.map(async (lessonItem) => {
      const isDone = await IsLessonDone.findOne({
        userId: userId,
        lessonId: lessonItem._id,
      });

      return {
        _id: lessonItem._id,
        sectionId: lessonItem.sectionId,
        name: lessonItem.name,
        content: lessonItem.content,
        access: lessonItem.access,
        type: lessonItem.type,
        description: lessonItem.description,
        isDone: Boolean(isDone) ? true : false,
      };
    });

    res.status(200).json({
      message: "Fetch all lessons of section id successfully!",
      lessons: await Promise.all(result),
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch lessons!", 422);
      return next(customError);
    }
  }
};

export const updateLessonDoneByUser = async (req: Request, res: Response, next: NextFunction) => {
  const { lessonId } = req.params;
  const { userId } = req.body;

  try {
    const lessonDoneByUser = await IsLessonDone.findOne({
      lessonId: lessonId,
      userId: userId,
    });

    if (!lessonDoneByUser) {
      const lessonDone = new IsLessonDone({
        lessonId: lessonId,
        userId: userId,
        isDone: true,
      });

      const result = await lessonDone.save();

      res.status(200).json({
        message: `Update lesson done successfully!`,
        result,
      });
    } else {
      res.status(200).json({
        message: `Lesson aldready done by user`,
        result: "nothing",
      });
    }
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to update lesson done!", 422);
      return next(customError);
    }
  }
};

export const getFreeLessonsByCourseId = async (req: Request, res: Response, next: NextFunction) => {
  const { courseId } = req.params;

  try {
    const sections = await Section.find({ courseId: courseId });

    const sectionIds = sections.map((section) => section._id);

    const freeLessons = await Lesson.find({
      sectionId: { $in: sectionIds },
      access: "FREE",
      isDeleted: false,
    }).sort({ createdAt: 1 });

    res.status(200).json({
      message: GET_SUCCESS,
      lessons: freeLessons,
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

export const getUsersByLessonId = async (req: Request, res: Response, next: NextFunction) => {
  const { lessonId } = req.params;

  try {
    const lessonDoneEntries = await IsLessonDone.find({ lessonId: lessonId }).populate(
      "userId",
      "name avatar"
    );
    const userIds = lessonDoneEntries.map((entry) => entry.userId);

    res.status(200).json({
      message: "Fetch all users who have done the lesson successfully!",
      users: userIds,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch users by lesson id!", 422);
      return next(customError);
    }
  }
};
