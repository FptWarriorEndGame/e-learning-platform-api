import { Schema, model } from "mongoose";
import baseSchema from "./BaseSchema";
import { ICoupon } from "../types/coupon.type";

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    discountAmount: {
      type: Number,
      required: true,
    },
    couponTypeId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon_Type",
      required: true,
    },
    usedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    dateStart: {
      type: Date,
      required: true,
    },
    dateEnd: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

couponSchema.add(baseSchema);

const Coupon = model<ICoupon>("Coupon", couponSchema);

export default Coupon;
