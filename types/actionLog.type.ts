import { Schema } from "mongoose";
import { IBaseSchema } from "./base.type";

export interface IActionLog extends IBaseSchema {
  description?: string;
  type: string;
  createdByName?: string;
  functionType?: string;
  [key: string]: Schema.Types.ObjectId | any;
}
