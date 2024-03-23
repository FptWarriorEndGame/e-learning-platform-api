import { Schema } from "mongoose";
import { IBaseSchema } from "./base.type";

export interface IDiscuss extends IBaseSchema {
  lessonId: Schema.Types.ObjectId;
  authorId: Schema.Types.ObjectId;
  content: string;
  replies: {
    userId: Schema.Types.ObjectId;
    contentReply: string;
    createdAt: Date;
    updatedAt?: Date;
  }[];
  emotions: {
    userId: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt?: Date;
  }[];
}
