import { Schema, model } from "mongoose";
import baseSchema from "./BaseSchema";
import { IIsLessonDone } from "../types/lesson.type";

const isLessonDoneSchema = new Schema<IIsLessonDone>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Lesson",
    },
    isDone: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

isLessonDoneSchema.add(baseSchema);

const IsLessonDone = model<IIsLessonDone>("IsLessonDone", isLessonDoneSchema);

export default IsLessonDone;
