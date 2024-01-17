import express, { NextFunction, Response, Request } from "express";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import bodyParser from "body-parser";
import multer from "multer";
import mongoose from "mongoose";
import cors from "cors";

import authRouter from "./routes/auth";
// const adminCategoryRouter = require("./routes/adminCategory");
// const adminCourseRouter = require("./routes/adminCourse");
// const adminSectionRouter = require("./routes/adminSection");
// const adminLessonRouter = require("./routes/adminLesson");
// const adminUserRouter = require("./routes/adminUser");
// const adminOrderRouter = require("./routes/adminOrder");
// const clientRouter = require("./routes/client");
// const reportRouter = require("./routes/report");
// const blogRouter = require("./routes/blog");
// const paymentRouter = require("./routes/payment");
// import commentsRouter from './routes/comments'

// import userCourseRouter from "./routes/userCourse";

const app = express();

app.use(cors());

const port = process.env.PORT || 9000;

const MONGODB_URI = "mongodb://127.0.0.1:27017/e_learning";

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/videos", express.static(path.join(__dirname, "videos")));

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, PATCH, DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, userId, adminRole, userRole"
  );
  next();
});

app.use("/auth", authRouter);
// app.use("/admin", adminCategoryRouter);
// app.use("/admin", adminCourseRouter);
// app.use("/admin", adminSectionRouter);
// app.use("/admin", adminLessonRouter);
// app.use("/admin", adminUserRouter);
// app.use("/admin", adminOrderRouter);
// app.use("/admin", reportRouter);

// app.use("/userCourse", userCourseRouter);

// app.use("/blog", blogRouter);
// app.use('/comments',commentsRouter );

// app.use("/payments", paymentRouter);

// app.use(clientRouter);
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.log(error);

  const status = error.statusCode || 500;
  const message = error.message;
  const errorType = error.errorType || "unknown";
  const data = error.data;

  res.status(status).json({
    message: message,
    errorType,
    data: data,
  });
});

mongoose
  .connect(MONGODB_URI)
  .then((result: any) => {
    app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });
  })
  .catch((err: any) => {
    console.log(err);
  });
