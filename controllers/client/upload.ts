import { Request, Response, NextFunction } from "express";
import { BACKEND_URL } from "../../config/backend-domain";
import CustomError from "../../utils/error";
import CustomErrorMessage from "../../utils/errorMessage";
const uploadURL = "https://e-learning-api.trannhatsang.com"
export const uploadVideo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const videoPath: string = req.file.path;

    const fullVideoPath: string = `${uploadURL}/${videoPath}`;

    const response = {
      message: "Video uploaded successfully",
      videoPath: fullVideoPath,
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage(
        "An error occurred while uploading the video",
        422
      );
      return next(customError);
    }
  }
};

export const uploadPDF = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pdfPath: string = req.file.path;

    const fullPDFPath: string = `${uploadURL}/${pdfPath}`;

    const response = {
      message: "PDF uploaded successfully",
      pdfPath: fullPDFPath,
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("An error occurred while uploading the PDF", 422);
      return next(customError);
    }
  }
};

export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const imagePath: string = req.file.path;

    const fullImagePath: string = `${uploadURL}/${imagePath}`;

    const response = {
      message: "PDF uploaded successfully",
      imagePath: fullImagePath,
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("An error occurred while uploading the PDF", 422);
      return next(customError);
    }
  }
};