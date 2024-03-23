import { Schema } from "mongoose";
import { IBaseSchema } from "../types/base.type";

const baseSchema: Schema<IBaseSchema> = new Schema<IBaseSchema>(
  {
    createdAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedAt: {
      type: Date,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { discriminatorKey: "kind" }
);

export default baseSchema;
