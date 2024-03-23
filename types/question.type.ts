import { Schema } from "mongoose";
import { IBaseSchema } from "./base.type";

export interface IQuestion extends IBaseSchema {
  id?: Schema.Types.ObjectId;
  code: string;
  name: string;
  correctAnswer: number;
  listAnswersOfQuestion: string[];
}

