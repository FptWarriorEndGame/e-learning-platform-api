import { Schema, Document } from "mongoose";

export interface IBaseSchema extends Document {
  createdAt: Date;
  createdBy?: Schema.Types.ObjectId;
  updatedAt: Date;
  updatedBy?: Schema.Types.ObjectId;
  isDeleted: boolean;
}
