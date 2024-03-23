import { Schema } from "mongoose";
import { IBaseSchema } from "./base.type";

export interface IBlog extends IBaseSchema {
  code: string;
  title: string;
  author: string;
  blogImg: string;
  technology: string;
  tags: string[];
  readTime: string;
  datePublished: Date;
  content: string;
  userId: Schema.Types.ObjectId;
  categoryId: Schema.Types.ObjectId;
}
