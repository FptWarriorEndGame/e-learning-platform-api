import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { v4 as uuidv4 } from 'uuid';

const videoStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, 'videos');
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    cb(null, uuidv4().substring(0, 8) + '-' + file.originalname);
  },
});

const videoFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (
    file.mimetype === 'video/mp4' ||
    file.mimetype === 'video/quicktime' ||
    file.mimetype === 'video/mpeg' ||
    file.mimetype === 'video/avi'
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only video formats such as MP4, QuickTime, MPEG, and AVI are allowed.'
      )
    );
  }
};

const videoUpload = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
});

export default videoUpload;
