import { Document, Schema } from "mongoose";
import { IBaseSchema } from "./base.type";

export interface IdiscussCourse extends IBaseSchema {
  title: string;
  code: string;
  comments: string;
  userId: Schema.Types.ObjectId;
  sectionId: Schema.Types.ObjectId;
  discussId: Schema.Types.ObjectId;
  parentDiscussId?: Schema.Types.ObjectId;
  replies: Schema.Types.ObjectId[];
  lessonId: Schema.Types.ObjectId;
  courseId: Schema.Types.ObjectId;
}
