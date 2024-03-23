import { Schema, model } from "mongoose";
import baseSchema from "./BaseSchema";
import { ICouponCourse } from "../types/coupon.type";

const couponCourseSchema = new Schema<ICouponCourse>(
  {
    code: {
      type: String,
      required: true,
    },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
  },
  { timestamps: true }
);

couponCourseSchema.add(baseSchema);

const CouponCourse = model<ICouponCourse>("Coupon_Course", couponCourseSchema);

export default CouponCourse;
