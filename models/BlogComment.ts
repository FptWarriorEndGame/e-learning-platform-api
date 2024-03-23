import { model, Schema } from "mongoose";
import baseSchema from "./BaseSchema";
import { IBlogComment } from "../types/commentsBlog.type";

const blogCommentSchema = new Schema<IBlogComment>(
  {
    code: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blogId: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    parentCommentId: {
      type: Schema.Types.ObjectId,
      ref: "BlogComment",
      default: null,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "BlogComment",
      },
    ],
  },
  {
    timestamps: true,
  }
);

blogCommentSchema.add(baseSchema);

const BlogComment = model<IBlogComment>("BlogComment", blogCommentSchema);

export default BlogComment;
