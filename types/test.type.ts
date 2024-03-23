import { Schema } from "mongoose";
import { IBaseSchema } from "./base.type";

export interface ITest extends IBaseSchema {
  id?: Schema.Types.ObjectId;
  courseId: Schema.Types.ObjectId;
  code: string;
  name: string;
  dateStart: Date;
  dateEnd: Date;
  status: string;
  timeLimitTest: number;
  listUserId: IUserJoinTest[] // User tham gia bài test
  numberCorrectAnswersToPass: number;
}

interface IUserJoinTest {
  userId: Schema.Types.ObjectId; 
}
