import { Document, Schema } from "mongoose";
import { IBaseSchema } from "./base.type";
  
export interface IBlogComment extends IBaseSchema {
  code: string;
  content: string;
  userId: Schema.Types.ObjectId;
  blogId: Schema.Types.ObjectId;
  parentCommentId?: Schema.Types.ObjectId;
  likes: Schema.Types.ObjectId[]; // Thêm dòng này
  replies: Schema.Types.ObjectId[];
}
