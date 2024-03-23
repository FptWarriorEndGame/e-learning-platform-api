import { Request, Response, NextFunction } from "express";
import Section from "../../models/Section";
import Lesson from "../../models/Lesson";
import CustomError from "../../utils/error";
import CustomErrorMessage from "../../utils/errorMessage";

export const getSectionsByCourseId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;

    const sectionsOfCourse = await Section.find({ courseId });

    const result = sectionsOfCourse.map(async (section) => {
      const lessons = await Lesson.find({ sectionId: section._id });
      const totalVideosLength = lessons.reduce((acc, lesson) => acc + lesson.videoLength, 0);
      return {
        ...section.toObject(),
        numOfLessons: lessons.length,
        totalVideosLength,
      };
    });

    res.status(200).json({
      message: "Fetch all sections by course id successfully!",
      sections: await Promise.all(result),
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


