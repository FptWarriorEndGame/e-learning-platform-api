import { Schema } from "mongoose";
import { IBaseSchema } from "./base.type";
import { IUser } from "./user.type";

export interface ISubscribe extends IBaseSchema {
  code: string;
  id?: Schema.Types.ObjectId;
  email: string;
  status: string;
  userId: IUser;
}
