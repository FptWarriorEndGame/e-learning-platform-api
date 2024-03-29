import { IBaseSchema } from "./base.type";
import { IUser } from "./user.type";
import { ICategory } from "./category.type";

export interface ICourse extends IBaseSchema {
  code?: string;
  name: string;
  subTitle?: string;
  thumbnail: string;
  access: string;
  views: number;
  price: number;
  finalPrice: number;
  description: string;
  level: string;
  courseSlug: string;
  userId: IUser;
  categoryId: ICategory;
  requirements?: string[];
  willLearns?: string[];
  tags?: string[];
  createdBy: any;
}

export interface ICourseDetail {
  _id: string;
  name: string;
  price: number;
  finalPrice: number;
  thumbnail: string;
  access: string;
  views: number;
  description: string;
  categoryId: {
    _id: string;
    name: string;
  };
  userId: {
    _id: string;
    name: string;
    avatar: string;
  };
  authorId?: {
    _id: string;
    name: string;
    avatar: string;
  };
  courseSlug: string;
  level: string;
  sections: number;
  lessons: number;
  students: number;
  totalVideosLength: number;
  numOfReviews: number;
  avgRatingStars: number;
  willLearns?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: {
    _id?: string;
    name?: string;
    avatar?: string;
  }
}
