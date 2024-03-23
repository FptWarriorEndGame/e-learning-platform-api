import { Types } from "mongoose";
import { IBaseSchema } from "./base.type";

export interface IPermission extends IBaseSchema {
  listPermission: string;
  userId: Types.ObjectId;
}
