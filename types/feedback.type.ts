import { Schema } from "mongoose";
import { IBaseSchema } from "./base.type";

export interface IFeedback extends IBaseSchema {
  code: string;
  name: string;
  email: string;
  message: string;
}

export interface IFeedbackReply extends IBaseSchema {
  code: string;
  feedbackId: Schema.Types.ObjectId;
  contentReply: string;
}
