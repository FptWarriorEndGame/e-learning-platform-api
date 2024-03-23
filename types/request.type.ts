import { Types } from "mongoose";
import { Request } from "express";

export interface IExtendsRequest extends Request {
  userId: Types.ObjectId;
}
