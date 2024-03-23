import { Schema } from "mongoose";
import { IBaseSchema } from "./base.type";

export interface ICoupon extends IBaseSchema {
  code: string;
  description: string;
  discountAmount: number;
  couponTypeId: Schema.Types.ObjectId;
  usedBy: Schema.Types.ObjectId[];
  dateStart: Date;
  dateEnd: Date;
}

export interface ICouponCourse extends IBaseSchema {
  code: string;
  couponId: Schema.Types.ObjectId;
  courseId: Schema.Types.ObjectId;
}
