import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";

const pdfStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, "pdfs");
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, uuidv4().substring(0, 8) + "-" + file.originalname);
  },
});

const pdfFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF files are allowed."));
  }
};

const pdfUpload = multer({
  storage: pdfStorage,
  fileFilter: pdfFilter,
});

export default pdfUpload;
