import { Schema, model } from "mongoose";
import baseSchema from "./BaseSchema";
import { IActionLog } from "../types/actionLog.type";

const actionLogSchema = new Schema<IActionLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
    },
    couponTypeId: {
      type: Schema.Types.ObjectId,
      ref: "CouponType",
    },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
    },
    testId: {
      type: Schema.Types.ObjectId,
      ref: "Test",
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    blogCategoryTypeId: {
      type: Schema.Types.ObjectId,
      ref: "BlogCategory",
    },
    blogId: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
    },
    description: {
      type: String, // DRAFT, SOON, FREE, PAID, PUBLIC, PRIVATE
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    createdByName: {
      type: String,
    },
    functionType: {
      type: String,
    },
  },
  { timestamps: true }
);

actionLogSchema.add(baseSchema);

const ActionLog = model<IActionLog>("ActionLog", actionLogSchema);

export default ActionLog;
