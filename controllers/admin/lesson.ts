import { Request, Response, NextFunction } from "express";
import Lesson from "../../models/Lesson";
import CustomError from "../../utils/error";
import CustomErrorMessage from "../../utils/errorMessage";

export const getLessons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lessons = await Lesson.find();

    res.status(200).json({
      message: "Fetch all lessons successfully!",
      lessons,
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
      const customError = new CustomErrorMessage("Failed to fetch lessons!", 422);
      return next(customError);
    }
  }
};

export const getLesson = async (req: Request, res: Response, next: NextFunction) => {
  const { lessonId } = req.params;

  try {
    const lesson = await Lesson.findById(lessonId);

    res.status(200).json({
      message: "Fetch single Lesson successfully!",
      lesson,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch lesson by id!", 422);
      return next(customError);
    }
  }
};

export const postLesson = async (req: Request, res: Response, next: NextFunction) => {
  // Bổ sung truyền xuống có thêm courseId
  const { sectionId, name, icon, description, type, content, access, videoLength, courseId } =
    req.body;

  try {
    const lesson = new Lesson({
      sectionId,
      name,
      icon,
      description,
      content,
      access,
      type,
      videoLength,
      courseId: courseId,
    });

    const response = await lesson.save();

    res.json({
      message: "Create Lesson successfully!",
      lesson: response,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to post lesson!", 422);
      return next(customError);
    }
  }
};

export const updateLesson = async (req: Request, res: Response, next: NextFunction) => {
  const { description, content, access, type, videoLength, courseId, name } = req.body;

  const { lessonId } = req.params;

  try {
    const updatedLesson = await Lesson.findByIdAndUpdate(
      lessonId,
      {
        name,
        description,
        content,
        access,
        type,
        videoLength,
        courseId: courseId,
      },
      { new: true }
    );

    if (!updatedLesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.status(200).json({
      message: "Update lesson successfully!",
      lesson: updatedLesson,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to update lesson!", 422);
      return next(customError);
    }
  }
};
