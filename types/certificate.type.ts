import { IBaseSchema } from "./base.type";
import { IUser } from "./user.type";
import { ICourse } from "./course.type";

export interface ICertificate extends IBaseSchema {
  certificateName: string;
  user: IUser;
  course: ICourse;
  dateValid?: Date;
}
