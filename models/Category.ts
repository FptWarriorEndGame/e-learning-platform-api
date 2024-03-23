import { Schema, model } from "mongoose";
import baseSchema from "./BaseSchema";
import { ICategory } from "../types/category.type";

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    cateImage: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    cateSlug: {
      type: String,
    },
    cateParent: {
      type: String,
    },
  },
  { timestamps: true }
);

categorySchema.add(baseSchema);

categorySchema.index({ name: "text", description: "text" });

const Category = model<ICategory>("Category", categorySchema);

export default Category;
