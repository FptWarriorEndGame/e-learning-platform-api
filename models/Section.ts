import { Schema, model } from "mongoose";
import baseSchema from "./BaseSchema";
import { ISection } from "../types/section.type";

const sectionSchema = new Schema<ISection>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Course",
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
    access: {
      type: String, // DRAFT, SOON, FREE, PAID, PUBLIC, PRIVATE (SHOULD CREATE ENUM DATA FOR THIS!)
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

sectionSchema.add(baseSchema);

const Section = model<ISection>("Section", sectionSchema);

export default Section;
