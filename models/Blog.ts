import { Schema, model } from "mongoose";
import { IBlog } from "../types/iBLog.type";
import baseSchema from "./BaseSchema";

const blogSchema = new Schema<IBlog>(
  {
    code: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    blogImg: {
      type: String,
      required: true,
    },
    technology: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    readTime: {
      type: String,
      required: true,
    },
    datePublished: {
      type: Date,
      default: Date.now,
    },
    content: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "BlogCategory",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

blogSchema.add(baseSchema);
blogSchema.index({ title: "text", content: "text" });

const BLog = model<IBlog>("Blog", blogSchema);
export default BLog;
