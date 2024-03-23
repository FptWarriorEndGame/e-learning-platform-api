import { Schema, model } from "mongoose";
import baseSchema from "./BaseSchema";
import { ITestUser } from "../types/testUser.type";

const testUserSchema = new Schema<ITestUser>(
  {
    testId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
    },
    dateTest: {
      type: Date,
    },
    timeTest: {
      type: Number,
    },
    status: {
      type: String,
      required: true
    },
    listQuestion: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: "Question",
          required: true
        },
        listAnswers: [
          {
            type: String
          }
        ],
        correctAnswer: {
          type: Number
        }
      }
    ]
  },
  { timestamps: true }
);

testUserSchema.add(baseSchema);

const TestUser = model<ITestUser>("TestUser", testUserSchema);

export default TestUser;
