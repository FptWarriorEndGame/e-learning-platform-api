import { model, Schema } from "mongoose";
import { IBlogComment } from "../types/commentsBlog.type";
import { IdiscussCourse } from "../types/IDiscussCourse.type";
import baseSchema from "./BaseSchema";

const CourseDiscurssSchema = new Schema<IdiscussCourse>(
  {
    code: {
      type: String,
      required: true,
    },
    comments: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    discussId: {
      type: Schema.Types.ObjectId,
      ref: "CourseDiscuss",
    },
    parentDiscussId: {
      type: Schema.Types.ObjectId,
      ref: "CourseDiscuss",
      default: null,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
    },
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: "Section",
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "CourseDiscuss",
      },
    ],
  },
  {
    timestamps: true,
  }
);

CourseDiscurssSchema.add(baseSchema);

const CourseDiscuss = model<IdiscussCourse>("CourseDiscuss", CourseDiscurssSchema);

export default CourseDiscuss;
