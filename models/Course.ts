import { Schema, model } from "mongoose";
import baseSchema from "./BaseSchema";
import { ICourse } from "../types/course.type";

const courseSchema = new Schema<ICourse>(
  {
    code: {
      type: String,
    },
    name: { 
      type: String,
      required: true,
      index: true,
    },
    subTitle: {
      type: String,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    access: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    courseSlug: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, // same meaning with createdBy
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    requirements: [
      {
        type: String,
      },
    ],
    willLearns: [
      {
        type: String,
      },
    ],
    tags: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

courseSchema.add(baseSchema);

courseSchema.index({ name: "text", description: "text" });

const Course = model<ICourse>("Course", courseSchema);

export default Course;
