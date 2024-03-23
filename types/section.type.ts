import { Schema } from "mongoose";
import { IBaseSchema } from "./base.type";

export interface ISection extends IBaseSchema {
  courseId: Schema.Types.ObjectId;
  name: string;
  access: string;
  description?: string;
}
