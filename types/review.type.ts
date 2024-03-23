import { Schema } from "mongoose";
import { IBaseSchema } from "./base.type";

export interface IReview extends IBaseSchema {
  code: string;
  userId: Schema.Types.ObjectId;
  courseId: Schema.Types.ObjectId;
  title: string;
  content: string;
  ratingStar: number;
  orderId: Schema.Types.ObjectId;
}

export interface IReviewReply extends IBaseSchema {
  code: string;
  reviewId: Schema.Types.ObjectId;
  contentReply: string;
}
