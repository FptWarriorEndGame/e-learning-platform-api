import { Schema } from "mongoose";
import { IBaseSchema } from "./base.type";

export interface IWishlist extends IBaseSchema {
  userId: Schema.Types.ObjectId;
  courseId: Schema.Types.ObjectId;
}
