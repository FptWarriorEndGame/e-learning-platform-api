import { Request, Response, NextFunction } from "express";
import Section from "../../models/Section";
import CustomError from "../../utils/error";
import CustomErrorMessage from "../../utils/errorMessage";

export const getSections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sections = await Section.find();

    res.status(200).json({
      message: "Fetch all Sections successfully!",
      sections,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch sections!", 422);
      return next(customError);
    }
  }
};

export const getSectionsByCourseId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;

    const sectionsOfCourse = await Section.find({ courseId });

    res.status(200).json({
      message: "Fetch all sections by course id successfully!",
      sections: sectionsOfCourse,
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

export const getSection = async (req: Request, res: Response, next: NextFunction) => {
  const { sectionId } = req.params;

  try {
    const section = await Section.findById(sectionId).populate("courseId");

    res.status(200).json({
      message: "Fetch single section successfully!",
      section,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch section by id!", 422);
      return next(customError);
    }
  }
};

export const postSection = async (req: Request, res: Response, next: NextFunction) => {
  const { courseId, name, access, description } = req.body;

  try {
    const section = new Section({
      courseId,
      name,
      access,
      description,
    });

    const response = await section.save();

    res.json({
      message: "Create section successfully!",
      Section: response,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to post section!", 422);
      return next(customError);
    }
  }
};

export const updateSection = async (req: Request, res: Response, next: NextFunction) => {
  const { courseId, name, access, description } = req.body;

  const { sectionId } = req.params;

  try {
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { courseId, name, access, description },
      { new: true }
    );

    if (!updatedSection) {
      return res.status(404).json({ message: "Section not found" });
    }

    res.json({
      message: "Update section successfully!",
      Section: updatedSection,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to update section!", 422);
      return next(customError);
    }
  }
};
