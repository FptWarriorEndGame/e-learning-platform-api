import { IBaseSchema } from "./base.type";

export interface IRevokedToken extends IBaseSchema {
  token: string;
}
