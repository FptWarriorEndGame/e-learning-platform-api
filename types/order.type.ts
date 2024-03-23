import { IBaseSchema } from "./base.type";
import { IUser } from "./user.type";
import { ICourse } from "./course.type";
import { ITransaction } from "./transaction.type";

export interface IOrder extends IBaseSchema {
  vatFee?: number;
  transaction: ITransaction;
  note?: string;
  totalPrice?: number;
  user: IUser;
  couponCode: string;
  items: ICourse[];
  status: string;
}

export interface IOrderItem {
  courseId: string;
  name?: string;
  finalPrice?: number;
  thumbnail?: string;
  reviewed?: boolean;
}
