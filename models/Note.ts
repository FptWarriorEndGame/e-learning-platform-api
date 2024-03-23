import mongoose, { Schema } from "mongoose";
import baseSchema from "./BaseSchema";
import { INoteCourse } from "../types/noteCourse.type";

const noteSchema = new Schema<INoteCourse>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    videoMinute: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

noteSchema.add(baseSchema);

const Note = mongoose.model<INoteCourse>("Note", noteSchema);

export default Note;
