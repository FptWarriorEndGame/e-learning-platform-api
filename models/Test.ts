import { Schema, model } from "mongoose";
import baseSchema from "./BaseSchema";
import { ITest } from "../types/test.type";

const testSchema = new Schema<ITest>(
  {
    courseId: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    dateStart: {
      type: Date,
      required: true,
    },
    dateEnd: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    timeLimitTest: {
      type: Number,
      required: true,
    },
    listUserId: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        }
      }
    ],
    numberCorrectAnswersToPass: {
      type: Number,
      required: true,
    }
  },
  { timestamps: true }
);

testSchema.add(baseSchema);

const Test = model<ITest>("Test", testSchema);

export default Test;
