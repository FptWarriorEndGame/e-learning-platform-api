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
  oldPrice: number;
  newPrice: number;
  discount: number;
  thumbnail: string;
  shortDesc: string;
  fullDesc: string;
  stockQty: number;
  categoryId: string;
  images: string;
  oldImages: string;
  thumb: string;
}

export interface IIsLessonDone extends IBaseSchema {
  userId: Schema.Types.ObjectId;
  lessonId: Schema.Types.ObjectId;
  isDone: boolean;
}
