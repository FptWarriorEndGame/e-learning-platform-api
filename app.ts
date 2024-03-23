import dotenv from 'dotenv';
dotenv.config(); 
import express, { NextFunction, Response, Request } from "express";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import bodyParser from "body-parser";
import multer from "multer";
import mongoose from "mongoose";
import cors from "cors";
import { Server } from "socket.io";
import authRouter from "./routes/auth";
import clientRouter from "./routes/client";
import adminRouter from "./routes/admin";

import { MONGODB_URI } from "./config/constant";
import { FRONTEND_URL } from "./config/frontend-domain";
import cron from "node-cron";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./types/socket.type";
// Likely your main server file or an initialization file

import { runRon } from "./cron";
const app = express();

app.use(cors());

const port = process.env.PORT || 9000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Define storage for uploaded files and public the path folder for users
app.use("images", express.static(path.join(__dirname, "assets/images")));
app.use("videos", express.static(path.join(__dirname, "assets/videos")));
app.use("pdfs", express.static(path.join(__dirname, "assets/pdfs")));
app.use("certificates", express.static(path.join(__dirname, "assets/certificates")));

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
app.use("/admin", adminRouter);
app.use(clientRouter);


interface AppError extends Error {
  statusCode?: number;
  errorType?: string;
  data?: any;
}

app.use((error: AppError, req: Request, res: Response, next: NextFunction): void => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const errorType = error.errorType || "unknown";
  const data = error.data;

  res.status(status).json({
    message: message,
    errorType: errorType,
    data: data,
  });
});
let io;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    const server = app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });
    io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
      server,
      {
        cors: {
          origin: `${FRONTEND_URL}`, // Allow your React app's origin
          methods: ["GET", "POST", "PUT", "PATCH", "OPTIONS", "DELETE"], // Might need to adjust allowed methods
        },
      }
    );
    // io.on("connection", (socket) => {
    //   console.log("Client connected");
    // });
  })
  .catch((err) => {
    console.log(err);
  });

export default app;
export { io };

/** AUTO RUN JOB HERE */


/** Auto run this job every 1 minutes */
// cron.schedule("* * * * *", function () {
//   console.log("This task runs every minute");
//   runRon()
// });

// Auto run every monday at 00:00
cron.schedule("0 0 0 * * 1", function () {
  console.log("This task runs every monday at 00:00");
});