import { Schema, model } from "mongoose";
import baseSchema from "./BaseSchema";
import { IQuestion } from "../types/question.type";

const questionSchema = new Schema<IQuestion>(
  {
    code: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    correctAnswer: {
      type: Number,
    },
    listAnswersOfQuestion: [
      {
        type: String,
      }
    ]
   
  },
  { timestamps: true }
);

questionSchema.add(baseSchema);

const Question = model<IQuestion>("Question", questionSchema);

export default Question;
