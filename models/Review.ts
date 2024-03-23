import { Schema, model } from "mongoose";
import baseSchema from "./BaseSchema";
import { IReview } from "../types/review.type";

const reviewSchema = new Schema<IReview>(
  {
    code: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    ratingStar: {
      type: Number,
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
  },
  { timestamps: true }
);

reviewSchema.add(baseSchema);

const Review = model<IReview>("Review", reviewSchema);

export default Review;
