import { IBaseSchema } from "./base.type";

export interface ICategory extends IBaseSchema {
  name: string;
  cateImage: string;
  description: string;
  cateSlug: string;
  cateParent: string;
}
