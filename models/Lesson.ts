import { Schema, model } from "mongoose";
import baseSchema, { IBaseSchema } from "./BaseSchema";
export interface ILesson extends IBaseSchema {
  sectionId: Schema.Types.ObjectId;
  name: string;
  icon?: string;
  description: string;
  content: string;
  videoLength?: number;
  access: string;
  type: string;
  password?: string;
}

const lessonSchema = new Schema<ILesson>(
  {
    sectionId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Section",
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
    icon: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    content: {
      type: String, // Link youtube
      required: true,
    },
    videoLength: {
      type: Number,
    },
    access: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
  },
  { timestamps: true }
);

lessonSchema.add(baseSchema);

const Lesson = model<ILesson>("Lesson", lessonSchema);

export default Lesson;
