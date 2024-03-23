import { Schema, model } from "mongoose";
import baseSchema from "./BaseSchema";
import { IReviewReply } from "../types/review.type";

const reviewReplySchema = new Schema<IReviewReply>(
  {
    code: {
      type: String,
      required: true,
    },
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: "Review",
      required: true,
    },
    contentReply: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

reviewReplySchema.add(baseSchema);

const ReviewReply = model("Review_Reply", reviewReplySchema);

export default ReviewReply;
