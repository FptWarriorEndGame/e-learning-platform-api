import { IBaseSchema } from "./base.type";

export interface ICouponType extends IBaseSchema {
  code: string;
  description: string;
  name: string;
}
