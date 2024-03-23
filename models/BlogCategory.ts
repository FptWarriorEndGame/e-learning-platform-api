import { Schema, model } from "mongoose";
import { ICategoryBlog } from "../types/iCategoryBlog";
import baseSchema from "./BaseSchema";

const blogCategorySchema = new Schema<ICategoryBlog>(
  {
    code: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    cateImage: {
      type: String,
      required: true,
    },
    blogs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Blog",
      },
    ],
  },
  {
    timestamps: true,
  }
);

blogCategorySchema.add(baseSchema);

const BlogCategory = model<ICategoryBlog>("BlogCategory", blogCategorySchema);

export default BlogCategory;
