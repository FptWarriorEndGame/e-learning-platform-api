import { Schema } from "mongoose";
import { IBaseSchema } from "./base.type";

export interface ITestUser extends IBaseSchema {
  id?: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  testId: Schema.Types.ObjectId;
  dateTest: Date;
  timeTest: number;
  score: number;
  status: string;
  listQuestion: IQuestion[]
}

interface IQuestion {
  questionId: Schema.Types.ObjectId;
  listAnswers: string[];
  correctAnswer: number;
}