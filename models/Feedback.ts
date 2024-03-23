import { Schema, model } from "mongoose";
import baseSchema from "./BaseSchema";
import { IFeedback } from "../types/feedback.type";

const feedbackSchema = new Schema<IFeedback>(
  {
    code: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

feedbackSchema.add(baseSchema);

const Feedback = model<IFeedback>("Feedback", feedbackSchema);

export default Feedback;
