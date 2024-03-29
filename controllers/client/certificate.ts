import { Request, Response, NextFunction } from "express";
import User from "../../models/User";
import Course from "../../models/Course";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { removeVietnameseAccents } from "../../utils/helper";
import Certificate from "../../models/Certificate";
import CustomError from "../../utils/error";
import CustomErrorMessage from "../../utils/errorMessage";
import moment from "moment";

const generateCertificate = (
  userName: string,
  courseName: string,
  completionDate: string,
  res: Response
): string => {
 try {
  const transformedCourseName = courseName.trim().split(" ").join("-");
  const certificateTemplatePath = path.join("assets/certificates", "certificate-template.png");
  const certificationName = `${userName}-${transformedCourseName}-certificate.pdf`;
  const outputCertification = path.join("assets/certificates", certificationName);

  const doc = new PDFDocument({ layout: "portrait", margins: { top: 0, bottom: 0, left: 0, right: 0 }, size: [595.28,841.89] });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${certificationName}"`);

  const writeStream = fs.createWriteStream(outputCertification);
  doc.pipe(writeStream);

  doc.image(certificateTemplatePath, 0, 0, {fit: [595.28,841.89]}); // A4 size!

  doc.fontSize(36).fillColor("#007BFF").text(userName, 0, 340, {
    align: "center",
  });

  doc.fontSize(24).fillColor("#333").text(`Course: ${courseName}`, {
    align: "center",
  });
  doc.fontSize(16).fillColor("#555").text("This certificate is awarded to", {
    align: "center",
  });
  doc.fontSize(16).fillColor("#555").text(completionDate, {
    align: "center",
  });

  doc.end();

  return certificationName;
 } catch (error) {
    throw error;
 }
};

export const postCertificate = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, courseId, completionDate } = req.body;
  try {
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    const existingCertificate = await Certificate.findOne({
      "user._id": userId,
      "course._id": courseId,
    });

    if (existingCertificate) {
      res.status(401).json({
        message: "Certificate already exists!",
      });
      return;
    }

    const convertedName = removeVietnameseAccents(user.name);

    const certificateName = generateCertificate(convertedName, course.name, moment(completionDate).format("DD-MM-YYYY"), res);

    const newCertificate = new Certificate({
      certificateName: certificateName,
      user: {
        _id: userId,
      },
      course: {
        _id: courseId,
      },
    });

    const createdCertificate = await newCertificate.save();

    res.status(201).json({
      message: "Post certificate successfully!",
      certificate: createdCertificate,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to create certificates for user!", 422);
      return next(customError);
    }
  }
};

export const testGenCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const certificateTemplatePath = path.join("assets/certificates", "certificate-template.png");
    const certificationName = `test-pdf-certificate.pdf`;
    const outputCertification = path.join("assets/certificates", certificationName);
  
    const doc = new PDFDocument({ layout: "portrait", margins: { top: 0, bottom: 0, left: 0, right: 0 }, size: [595.28,841.89] });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${certificationName}"`);
  
    const writeStream = fs.createWriteStream(outputCertification);
    doc.pipe(writeStream);
  
    doc.image(certificateTemplatePath, 0, 0, {fit: [595.28,841.89]}); // A4 size!
  
    doc.fontSize(36).fillColor("#007BFF").text("Tran Nhat Sang", 0, 340, {
      align: "center",
      lineGap: 6
    });
    doc.fontSize(24).fillColor("#333").text(`Course: ${"React Native"}`, {
      align: "center",
      lineGap: 6
    });
    doc.fontSize(16).fillColor("#555").text("This certificate is awarded to", {
      align: "center",
      lineGap: 6
    });
    doc.fontSize(16).fillColor("#555").text("12-01-2022", {
      align: "center",
      lineGap: 6
    });
  
    doc.end();
  
    res.status(201).json({
      message: "Post certificate successfully!",
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to create certificates for user!", 422);
      return next(customError);
    }
  }
};

export const getCertificate = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, courseId } = req.query;
  try {
    const certificate = await Certificate.findOne({
      "user._id": userId,
      "course._id": courseId,
    });
    res.status(201).json({
      message: "Get certification successfully!",
      certificate,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to get certifications", 422);
      return next(customError);
    }
  }
};
