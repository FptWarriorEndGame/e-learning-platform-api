import { Request, Response, NextFunction } from "express";
import CustomErrorMessage from "./errorMessage";
import CustomError from "./error";
import Order from "../models/Order";
import { IOrder } from "../types/order.type";
import Course from "../models/Course";
import { ICourse, ICourseDetail } from "../types/course.type";
import Review from "../models/Review";
import Section from "../models/Section";
import { ISection } from "../types/section.type";
import Lesson from "../models/Lesson";
import { ILesson, IIsLessonDone } from "../types/lesson.type";
import IsLessonDone from "../models/IsLessonDone";
import { Configuration, OpenAIApi } from "openai";
import mongoose from "mongoose";
import { courseNames, devopsCourses, blockchainCourses } from "./fakerData";
import slugify from "slugify";
import { faker } from "@faker-js/faker";
import fs from "fs";
import path from "path";
import axios from "axios";
import { UNSPLASH_API_KEY, OPEN_AI_KEY } from "../config/constant";
import { BACKEND_URL } from "../config/backend-domain";
const configuration = new Configuration({
  apiKey: OPEN_AI_KEY,
});
import { COUPON_TYPES } from "../config/constant";
import { ICoupon } from "../types/coupon.type";
export const openai = new OpenAIApi(configuration);

type AccentMap = Record<string, string>;

const accentsMap: AccentMap = {
  á: "a",
  à: "a",
  ả: "a",
  ã: "a",
  ạ: "a",
  ă: "a",
  ắ: "a",
  ằ: "a",
  ẳ: "a",
  ẵ: "a",
  ặ: "a",
  â: "a",
  ấ: "a",
  ầ: "a",
  ẩ: "a",
  ẫ: "a",
  ậ: "a",
  đ: "d",
  é: "e",
  è: "e",
  ẻ: "e",
  ẽ: "e",
  ẹ: "e",
  ê: "e",
  ế: "e",
  ề: "e",
  ể: "e",
  ễ: "e",
  ệ: "e",
  í: "i",
  ì: "i",
  ỉ: "i",
  ĩ: "i",
  ị: "i",
  ó: "o",
  ò: "o",
  ỏ: "o",
  õ: "o",
  ọ: "o",
  ô: "o",
  ố: "o",
  ồ: "o",
  ổ: "o",
  ỗ: "o",
  ộ: "o",
  ơ: "o",
  ớ: "o",
  ờ: "o",
  ở: "o",
  ỡ: "o",
  ợ: "o",
  ú: "u",
  ù: "u",
  ủ: "u",
  ũ: "u",
  ụ: "u",
  ư: "u",
  ứ: "u",
  ừ: "u",
  ử: "u",
  ữ: "u",
  ự: "u",
  ý: "y",
  ỳ: "y",
  ỷ: "y",
  ỹ: "y",
  ỵ: "y",
  Á: "A",
  À: "A",
  Ả: "A",
  Ã: "A",
  Ạ: "A",
  Ă: "A",
  Ắ: "A",
  Ằ: "A",
  Ẳ: "A",
  Ẵ: "A",
  Ặ: "A",
  Â: "A",
  Ấ: "A",
  Ầ: "A",
  Ẩ: "A",
  Ẫ: "A",
  Ậ: "A",
  Đ: "D",
  É: "E",
  È: "E",
  Ẻ: "E",
  Ẽ: "E",
  Ẹ: "E",
  Ê: "E",
  Ế: "E",
  Ề: "E",
  Ể: "E",
  Ễ: "E",
  Ệ: "E",
  Í: "I",
  Ì: "I",
  Ỉ: "I",
  Ĩ: "I",
  Ị: "I",
  Ó: "O",
  Ò: "O",
  Ỏ: "O",
  Õ: "O",
  Ọ: "O",
  Ô: "O",
  Ố: "O",
  Ồ: "O",
  Ổ: "O",
  Ỗ: "O",
  Ộ: "O",
  Ơ: "O",
  Ớ: "O",
  Ờ: "O",
  Ở: "O",
  Ỡ: "O",
  Ợ: "O",
  Ú: "U",
  Ù: "U",
  Ủ: "U",
  Ũ: "U",
  Ụ: "U",
  Ư: "U",
  Ứ: "U",
  Ừ: "U",
  Ử: "U",
  Ữ: "U",
  Ự: "U",
  Ý: "Y",
  Ỳ: "Y",
  Ỷ: "Y",
  Ỹ: "Y",
  Ỵ: "Y",
};

export const removeVietnameseAccents = (str: string): string => {
  return str
    .split("")
    .map((char) => accentsMap[char] || char)
    .join("");
};

export const getProgressOfCourse = async (courseId: string, userId: string) => {
  const sectionsOfCourse: ISection[] = await Section.find({
    courseId,
  });

  let numOfLessonDone: number = 0;
  let totalVideosLengthDone: number = 0;
  let lessonsOfCourse: ILesson[] = [];

  for (const section of sectionsOfCourse) {
    const lessons: ILesson[] = await Lesson.find({
      sectionId: section._id,
    });
    lessonsOfCourse.push(...lessons);
  }

  for (const lesson of lessonsOfCourse) {
    const isDone: IIsLessonDone | null = await IsLessonDone.findOne({
      userId,
      lessonId: lesson._id,
    });
    // const isDone: IIsLessonDone | null = dictLessonDone[userId.toString() + lesson._id.toString()]

    if (isDone) {
      numOfLessonDone += 1;
      totalVideosLengthDone += lesson.videoLength;
    }
  }

  const numOfLessons: number = lessonsOfCourse.length;

  let progress: number = numOfLessons === 0 ? 0 : numOfLessonDone / numOfLessons;

  return {
    progress,
    totalVideosLengthDone,
  };
};

export const getCoursesOrderByUserId = async (userId: string) => {
  const courses = await Order.find({
    "user._id": userId,
  })
    .select("items")
    .populate("items._id");

  const results = courses
    .map((courseItem) => {
      return courseItem.items;
    })
    .flat()
    .map((item) => item._id);

  return results;
};

export const getCourseDetailInfo = async (courseId: string): Promise<ICourseDetail> => {
  try {
    const course = (await Course.findById(courseId)
      .populate("categoryId", "_id name")
      .populate("userId", "_id name avatar")) as ICourseDetail;

    const sections = (await Section.find({ courseId })) as ISection[];

    const lessonsOfCoursePromise = sections.map(async (sectionItem) => {
      const lessons = (await Lesson.find({ sectionId: sectionItem._id })) as ILesson[];
      return lessons;
    });

    const lessonsOfCourse = (await Promise.all(lessonsOfCoursePromise)).flat();

    const orders = (await Order.find({ "items._id": courseId })) as IOrder[];
    const numOfStudents = orders.length;

    const totalVideosLength = lessonsOfCourse.reduce(
      (acc, lesson) => acc + (lesson.videoLength || 0),
      0
    );

    const reviews = await Review.find({ courseId });

    const avgRatingStars =
      reviews.reduce((acc, review) => acc + review.ratingStar, 0) / reviews.length || 0;

    const result: ICourseDetail = {
      _id: course._id,
      name: course.name,
      price: course.price,
      finalPrice: course.finalPrice,
      thumbnail: course.thumbnail,
      access: course.access,
      views: course.views,
      description: course.description,
      categoryId: {
        _id: course.categoryId._id,
        name: course.categoryId.name,
      },
      userId: {
        _id: course.userId._id,
        name: course.userId.name,
        avatar: course.userId.avatar,
      },
      courseSlug: course.courseSlug,
      level: course.level,
      sections: sections.length,
      lessons: lessonsOfCourse.length,
      students: numOfStudents,
      totalVideosLength,
      numOfReviews: reviews.length,
      avgRatingStars,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };

    return result;
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    } else {
      const customError = new CustomErrorMessage("Failed to fetch courses!", 422);
      throw customError;
    }
  }
};

export const getCoursesOrderedByUserInfo = async (userId: string): Promise<ICourse[]> => {
  try {
    const orders = (await Order.find({
      "user._id": userId,
      status: "Success",
    })
      .select("items")
      .populate("items._id")) as IOrder[];

    const courses = orders.flatMap((order) => order.items).map((item) => item._id as ICourse);

    return courses;
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    } else {
      const customError = new CustomErrorMessage("Failed to fetch courses!", 422);
      throw customError;
    }
  }
};

export const calculateTotalPrice = async (courseIdArray: string[]) => {
  let totalPrice = 0;
  try {
    const courses = await Course.find({ _id: { $in: courseIdArray } }).select("finalPrice");

    courses.forEach((course) => {
      totalPrice += course.finalPrice;
    });
    return totalPrice;
  } catch (error) {
    throw new Error("Error calculating total price");
  }
};

export const getMaxDiscountCoupon = (totalPrice: number, coupons: ICoupon[]) => {
  let maxPercentDiscount = 0;
  let maxFixedAmountDiscount = 0;
  let maxPercentDiscountCoupon: ICoupon | null = null;
  let maxFixedDiscountCoupon: ICoupon | null = null;

  coupons.forEach((coupon) => {
    const couponTypeIdString = String(coupon.couponTypeId);

    if (couponTypeIdString === COUPON_TYPES.COUPON_TYPE_PERCENT) {
      if (coupon.discountAmount > maxPercentDiscount) {
        maxPercentDiscount = coupon.discountAmount;
        maxPercentDiscountCoupon = coupon;
      }
    } else if (couponTypeIdString === COUPON_TYPES.COUPON_TYPE_FIXED_AMOUNT) {
      if (coupon.discountAmount > maxFixedAmountDiscount) {
        maxFixedAmountDiscount = coupon.discountAmount;
        maxFixedDiscountCoupon = coupon;
      }
    }
  });

  if (maxPercentDiscount === 0) {
    return maxFixedDiscountCoupon;
  } else if (maxFixedAmountDiscount === 0) {
    return maxPercentDiscountCoupon;
  }

  maxPercentDiscount = (totalPrice * maxPercentDiscount) / 100;

  const percentDiscountedPrice = totalPrice - maxPercentDiscount;
  const fixedAmountDiscountedPrice = totalPrice - maxFixedAmountDiscount;

  if (percentDiscountedPrice < fixedAmountDiscountedPrice) {
    return maxPercentDiscountCoupon;
  } else {
    return maxFixedDiscountCoupon;
  }
};
