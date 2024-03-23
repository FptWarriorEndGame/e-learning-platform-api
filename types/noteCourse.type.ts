import { Types } from "mongoose";
import { IBaseSchema } from "./base.type";

export interface INoteCourse extends IBaseSchema {
  _id: string;
  userId: Types.ObjectId;
  lessonId: Types.ObjectId;
  courseId: Types.ObjectId;
  content: string;
  videoMinute: number;
}
