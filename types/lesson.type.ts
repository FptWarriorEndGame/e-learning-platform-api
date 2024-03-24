import { Schema } from "mongoose";
import { IBaseSchema } from "./base.type";

export interface ILesson extends IBaseSchema {
  sectionId: Schema.Types.ObjectId;
  courseId?: Schema.Types.ObjectId;
  name: string;
  icon?: string;
  description: string;
  content: string;
  videoLength?: number;
  access: string;
  type: string;
  password?: string;
}

export interface IIsLessonDone extends IBaseSchema {
  userId: Schema.Types.ObjectId;
  lessonId: Schema.Types.ObjectId;
  isDone: boolean;
}
