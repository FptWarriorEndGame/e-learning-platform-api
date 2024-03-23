import { Request, Response, NextFunction } from "express";
import Lesson from "../../models/Lesson";
import IsLessonDone from "../../models/IsLessonDone";
import CustomError from "../../utils/error";
import CustomErrorMessage from "../../utils/errorMessage";

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
