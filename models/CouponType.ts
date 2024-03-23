import { Schema, model } from "mongoose";
import baseSchema from "./BaseSchema";
import { ICouponType } from "../types/couponType.type";

const couponTypeSchema = new Schema<ICouponType>(
  {
    code: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

couponTypeSchema.add(baseSchema);

const CouponType = model<ICouponType>("Coupon_Type", couponTypeSchema);

export default CouponType;
