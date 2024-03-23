import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";

const fileStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, "images");
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, uuidv4().substring(0, 8) + "-" + file.originalname);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PNG, JPG, and JPEG files are allowed."));
  }
};

const upload = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
});

export default upload;
