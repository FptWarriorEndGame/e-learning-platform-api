import { Schema, model } from "mongoose";
import baseSchema from "./BaseSchema";
import { ICertificate } from "../types/certificate.type";

const certificateSchema = new Schema<ICertificate>(
  {
    certificateName: { type: String, required: true },
    user: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
    course: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true,
      },
    },
    dateValid: { type: Date },
  },
  { timestamps: true }
);

certificateSchema.add(baseSchema);

const Certificate = model<ICertificate>("Certificate", certificateSchema);

export default Certificate;
