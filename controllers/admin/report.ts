import { Request, Response, NextFunction } from "express";
import Category from "../../models/Category";
import Course from "../../models/Course";
import User from "../../models/User";
import Order from "../../models/Order";
import CustomError from "../../utils/error";
import CustomErrorMessage from "../../utils/errorMessage";
import { AuthorAuthRequest } from "../../middleware/is-auth";
import { enumData } from "../../config/enumData";
import mongoose from "mongoose";
import IsLessonDone from "../../models/IsLessonDone";
import Section from "../../models/Section";
import Lesson from "../../models/Lesson";
import { ISection } from "../../types/section.type";
import { IIsLessonDone, ILesson } from "../../types/lesson.type";
import moment from "moment";
import Wishlist from "../../models/Wishlist";
import Review from "../../models/Review";
import ObjectId from 'mongoose';

interface UserReportItem {
  _id: string;
  name: string;
  role: string;
  registered: Date | string | null;
  lastLogin: Date | string | null;
  lastEnrollment: Date | string | null;
  studyTime: number;
  allCourses: number;
  completedCourses: number;
  inCompletedCourses: number;
  certificates: number;
  avgScore: number;
}

interface CourseReportItem {
  _id: string;
  name: string;
  author: string;
  learners: number;
  avgStudyTime: number;
  views: number;
  socialInteractions?: number;
  totalVideosLength: number;
  lessons: number;
  numberOfWishlist: number;
  avgRatings?: number;
  numberOfRatings?: number;
  saleOfCourse?: number;
}

export const getSummaryReports = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const currentDate = new Date();
  const thirtyDaysAgo = new Date(currentDate);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const categoryQuery: any = {}
  const courseQuery: any = {}
  const userQuery: any = {}
  if (req.role && req.role === enumData.UserType.Author.code) {
    categoryQuery.createdBy = new mongoose.Types.ObjectId(req.userId) as any;
    courseQuery.createdBy = new mongoose.Types.ObjectId(req.userId) as any;
    userQuery.createdBy = new mongoose.Types.ObjectId(req.userId) as any;
  }

  try {
    const categories = await Category.countDocuments(categoryQuery);
    const courses = await Course.countDocuments(courseQuery);
    const users = await User.countDocuments(userQuery);

    const orders = await Order.find({
      createdAt: { $gte: thirtyDaysAgo, $lte: currentDate },
    });

    const saleOf30days = orders.reduce((total, order) => {
      return total + order.totalPrice;
    }, 0);

    const avgTimeLearningPerUser = 10;
    const conversions = 50;

    const reports = {
      categories,
      courses,
      users,
      orders,
      saleOf30days,
      avgTimeLearningPerUser,
      conversions,
    };

    res.status(200).json({
      message: "Successfully to get summary reports",
      reports: reports,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to get summary reports!", 422);
      return next(customError);
    }
  }
};

export const getCourseSales = async (req: Request, res: Response, next: NextFunction) => {
  let previousDays: number = parseInt(req.query.days as string) || 7;

  if (previousDays < 0) {
    previousDays = 7;
  }

  const currentDate: Date = new Date();
  const previousDaysAgo: Date = new Date(currentDate);
  previousDaysAgo.setDate(previousDaysAgo.getDate() - previousDays);

  try {
    const orders = await Order.find({
      createdAt: { $gte: previousDaysAgo, $lte: currentDate },
    });

    const numberSalesByDate: { [key: string]: number } = {};

    orders.forEach((order) => {
      const date = order.createdAt.toDateString();
      if (!numberSalesByDate[date]) {
        numberSalesByDate[date] = 0;
      }
      numberSalesByDate[date] += 1;
    });

    const labels: string[] = [];
    const data: number[] = [];
    let currentDateIter: Date = new Date(previousDaysAgo);
    while (currentDateIter <= currentDate) {
      const dateStr: string = currentDateIter.toDateString();
      labels.push(dateStr);
      data.push(numberSalesByDate[dateStr] || 0);
      currentDateIter.setDate(currentDateIter.getDate() + 1);
    }

    res.status(200).json({
      message: "Successfully to get course sales",
      labels,
      data,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch course sales!", 422);
      return next(customError);
    }
  }
};

export const getRevenues = async (req: Request, res: Response, next: NextFunction) => {
  let previousDays: number = parseInt(req.query.days as string) || 7;

  if (previousDays < 0) {
    previousDays = 7;
  }

  const currentDate: Date = new Date();
  const previousDaysAgo: Date = new Date(currentDate);
  previousDaysAgo.setDate(previousDaysAgo.getDate() - previousDays);

  try {
    const orders = await Order.find({
      createdAt: { $gte: previousDaysAgo, $lte: currentDate },
    });

    const salesByDate: { [key: string]: number } = {};

    orders.forEach((order) => {
      const date = order.createdAt.toDateString();
      if (!salesByDate[date]) {
        salesByDate[date] = 0;
      }
      salesByDate[date] += order.totalPrice;
    });

    const labels: string[] = [];
    const data: number[] = [];
    let currentDateIter: Date = new Date(previousDaysAgo);
    while (currentDateIter <= currentDate) {
      const dateStr: string = currentDateIter.toDateString();
      labels.push(dateStr);
      data.push(salesByDate[dateStr] || 0);
      currentDateIter.setDate(currentDateIter.getDate() + 1);
    }

    res.status(200).json({
      message: "Successfully to get course revenues",
      labels,
      data,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch course revenues!", 422);
      return next(customError);
    }
  }
};

export const getNewUserSignups = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  

  const userQuery: any = {}
  if (req.role && req.role === enumData.UserType.Author.code) {
    userQuery.createdBy = new mongoose.Types.ObjectId(req.userId) as any;
  }
  try {
    let previousDays: number = parseInt(req.query.days as string) || 7;

    if (previousDays < 0) {
      previousDays = 7;
    }

    const currentDate: Date = new Date();
    const previousDaysAgo: Date = new Date(currentDate);
    previousDaysAgo.setDate(previousDaysAgo.getDate() - previousDays);

    if(previousDays && currentDate) {
      userQuery.createdAt = { $gte: previousDaysAgo, $lte: currentDate };
    }

    const users = await User.find(userQuery);

    const signupsByDate: { [key: string]: number } = {};

    users.forEach((user) => {
      const date = user.createdAt.toDateString();
      if (!signupsByDate[date]) {
        signupsByDate[date] = 0;
      }
      signupsByDate[date] += 1;
    });

    const labels: string[] = [];
    const data: number[] = [];
    const daysAgo: Date[] = [];
    let currentDateIter: Date = new Date(previousDaysAgo);
    while (currentDateIter <= currentDate) {
      const dateStr: string = currentDateIter.toDateString();
      labels.push(dateStr);
      data.push(signupsByDate[dateStr] || 0);
      daysAgo.push(new Date(currentDateIter));
      currentDateIter.setDate(currentDateIter.getDate() + 1);
    }

    res.status(200).json({
      message: "Successfully to get new users signup",
      labels,
      data,
      daysAgo,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch users new signup", 422);
      return next(customError);
    }
  }
};

export const getNewUserSignupsList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let previousDays: number = parseInt(req.query.days as string) || 60;

    if (previousDays < 0) {
      previousDays = 60;
    }

    const currentDate: Date = new Date();
    const previousDaysAgo: Date = new Date(currentDate);
    previousDaysAgo.setDate(previousDaysAgo.getDate() - previousDays);

    const users = await User.find({
      createdAt: { $gte: previousDaysAgo, $lte: currentDate },
    });

    const signupsByDate: { [key: string]: number } = {};

    users.forEach((user) => {
      const date = user.createdAt.toDateString();
      if (!signupsByDate[date]) {
        signupsByDate[date] = 0;
      }
      signupsByDate[date] += 1;
    });

    const labels: string[] = [];
    const data: number[] = [];
    const daysAgo: Date[] = [];
    let currentDateIter: Date = new Date(previousDaysAgo);
    while (currentDateIter <= currentDate) {
      const dateStr: string = currentDateIter.toDateString();
      labels.push(dateStr);
      data.push(signupsByDate[dateStr] || 0);
      daysAgo.push(new Date(currentDateIter));
      currentDateIter.setDate(currentDateIter.getDate() + 1);
    }

    res.status(200).json({
      message: "Successfully to get new users signup",
      labels,
      data,
      daysAgo,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch users new signup", 422);
      return next(customError);
    }
  }
};

export const getReportsUserProgress = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const dateStart = req.query.dateStart as string; // Replace with your start date
  const dateEnd = req.query.dateEnd as string;   // Replace with your end date
  const authorId = req.query.authorId as string;
  try {
    
    // Query
    const orderQuery: any = {};
    const userQuery: any = {
      // createdBy: req.query.authorId
    };
    const reviewQuery: any = {};
    const wishlistQuery: any = {};
    if(req.userId) {
      // Chỉ list ra những User của tác giả hiện tại - Nếu đăng nhập bằng tài khoản tác giả!
      
    }

    if(dateStart && dateEnd) {
      orderQuery.createdAt = {
        $gte: moment(dateStart, 'DD/MM/YYYY').toDate(), 
        $lte: moment(dateEnd, 'DD/MM/YYYY').toDate()
    }
      reviewQuery.createdAt = {
        $gte: moment(dateStart, 'DD/MM/YYYY').toDate(), 
        $lte: moment(dateEnd, 'DD/MM/YYYY').toDate()
    }
      wishlistQuery.createdAt = {
        $gte: moment(dateStart, 'DD/MM/YYYY').toDate(), 
        $lte: moment(dateEnd, 'DD/MM/YYYY').toDate()
    }

    userQuery.createdAt = {
      $gte: moment(dateStart, 'DD/MM/YYYY').toDate(), 
      $lte: moment(dateEnd, 'DD/MM/YYYY').toDate()
    }
    
    }

    // TODO: SHOULD SEARCH FOR USER HAVE ROLE (USER - STUDENT!)
    const users = await User.find({
      role: enumData.UserType.User.code, // TODO LATER!
      ...userQuery
    }).sort({
      createdAt: -1
    });
    const result: UserReportItem[] = [];

    const dictCoursesOfUser: Record<string, any> = {}
    const dictUsersOfAuthor: Record<string, any> = {}
    const dictCoursesOfAuthor: Record<string, any> = {}
    const dictCourse: Record<string, any> = {}
    const dictOrdersOfUser: Record<string, any> = {}
    const dictLessonsDoneOfUser: Record<string, any> = {}
    const dictSectionOfCourse: Record<string, any> = {}
    const dictLessonsOfCourse: Record<string, any> = {}
    const dictLessonsOfSection: Record<string, any> = {}
    // dict lessons of course

    const lessonDoneRes = await IsLessonDone.find().populate('lessonId');
    const courseRes = await Course.find().populate('createdBy');
    const sectionsRes = await Section.find();
    const lessonsRes = await Lesson.find();
    const ordersRes = await Order.find(orderQuery);
   
    // create dict lessons of section
    lessonsRes.forEach((item) => {
      const currentKey = item.sectionId.toString()
      if(dictLessonsOfSection[currentKey]) {
        dictLessonsOfSection[currentKey].push(item)
      } else {
        dictLessonsOfSection[currentKey] = [item]
      }
    })

    // Group lesson done by userId (create dict lessons of of user and lesson)
    lessonDoneRes.forEach((item: any) => {
      if(item._doc) {
        const currentKey = item.userId.toString() + item.lessonId?._id?.toString();
        const currentValue = {
          ...item._doc,
          lesson: item._doc?.lessonId
        }
        dictLessonsDoneOfUser[currentKey] = currentValue
      }
    })

    // Group section by course id (dict sections of course)
    sectionsRes.forEach((item) => {
      if (item.courseId) {
        if (dictSectionOfCourse[item.courseId.toString()]) {
          dictSectionOfCourse[item.courseId.toString()].push(item)
        } else {
          dictSectionOfCourse[item.courseId.toString()] = [item]
        }
      }
    })

     // Group lesson by course id
     courseRes.forEach((courseItem) => {

      const listSectionOfCourse = dictSectionOfCourse[courseItem._id.toString()] as ISection[] ?? [];
      listSectionOfCourse.forEach((sectionItem) => {
          const listLessonOfSection = dictLessonsOfSection[sectionItem._id.toString()] ?? [];
          listLessonOfSection.forEach((lessonItem) => {
              if (dictLessonsOfCourse[courseItem._id.toString()]) {
                dictLessonsOfCourse[courseItem._id.toString()].push(lessonItem)
              } else {
                dictLessonsOfCourse[courseItem._id.toString()] = [lessonItem]
              }
          })

      })
      dictCourse[courseItem._id.toString()] = courseItem
    })
    
    const orderDetails = ordersRes.flatMap((order) => {
      return order.items.map((item: any) => ({
        orderId: order._id, 
        userId: order.user._id,
        userEmail: order.user.email,
        // ... other relevant order fields if needed
    
        courseId: item._id,
        courseName: item.name,
        courseThumbnail: item.thumbnail,
        coursePrice: item.finalPrice,
        reviewed: item.reviewed,
        
      }));
    });

    // create dict courses of user
    orderDetails.forEach((item) => {
      if (item.userId) {
        if (dictCoursesOfUser[item.userId]) {
          dictCoursesOfUser[item.userId].push(item)
        } else {
          dictCoursesOfUser[item.userId] = [item]
        }
        const currentAuthorId = dictCourse[item.courseId.toString()]?.createdBy?._id?.toString();
        
        if(currentAuthorId) {
          if(dictUsersOfAuthor[currentAuthorId]) {
            dictUsersOfAuthor[currentAuthorId].push(item.userId.toString())
          }else {
            dictUsersOfAuthor[currentAuthorId] = [item.userId.toString()]
          }

          if(dictCoursesOfAuthor[currentAuthorId]) {
            dictCoursesOfAuthor[currentAuthorId].push(item.courseId.toString())
          }else {
            dictCoursesOfAuthor[currentAuthorId] = [item.courseId.toString()]

          }
        }
        // create dict for author

      }
    })
    // create dict orders of user
    ordersRes.forEach((item) => {
      if(item.user) {
        const currentKey = item.user._id.toString();
        if (dictOrdersOfUser[currentKey]) {
          dictOrdersOfUser[currentKey].push(item)
        } else {
          dictOrdersOfUser[currentKey] = [item]
        }
      }
    })

    let resUser = users;
    let listCourseIdOfCurrentAuthor = []
    if(req.userId && enumData.UserType.Author.code) {
      // Danh sách userId của tác giả 
      const listUserIdOfCurrentAuthor = dictUsersOfAuthor[req.userId]
      resUser = users.filter((item) => listUserIdOfCurrentAuthor.includes(item._id.toString()))

     listCourseIdOfCurrentAuthor = dictCoursesOfAuthor[req.userId]
    }
    if(authorId) {
      const listUserIdOfCurrentAuthor = dictUsersOfAuthor[authorId]
      resUser = users.filter((item) => listUserIdOfCurrentAuthor.includes(item._id.toString()))
    }
    

    for (const user of resUser) {
      // current key
      const currentUserId = user?._id.toString()
      // List orders
      const listOrdersOfCurrentUser = dictOrdersOfUser[currentUserId] ?? [];
      const lastEnrollment = listOrdersOfCurrentUser.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })[0]?.createdAt ?? null;
      let studyTime = 0;
      const completedCourses = [];

      // List courses
      let listCourseOfCurrentUser = dictCoursesOfUser[currentUserId] ?? [];
      if(listCourseIdOfCurrentAuthor.length > 0) {
        listCourseOfCurrentUser = listCourseOfCurrentUser.filter((item) => listCourseIdOfCurrentAuthor.includes(item.courseId.toString()))
      }

      for (const course of listCourseOfCurrentUser) {
        // const listSectionOfCurrentCourse = dictSectionOfCourse[course?.courseId.toString()] ?? [];
        
        const listLessonOfCurrentCourse = dictLessonsOfCourse[course?.courseId.toString()] ?? [];
        const listLessonDone = []
        for (const lessonItem of listLessonOfCurrentCourse) {
          if(dictLessonsDoneOfUser[currentUserId + lessonItem._id.toString()]) {
            const lessonDone = dictLessonsDoneOfUser[currentUserId + lessonItem._id.toString()];
            if(lessonDone) {
              studyTime += lessonDone?.lesson?.videoLength ?? 0;
              listLessonDone.push(lessonDone);
            }
          }
        }

        let currentUserProgress = 0; 
        if(listLessonOfCurrentCourse.length > 0) {
          currentUserProgress = listLessonDone.length / listLessonOfCurrentCourse.length
        }
        
        // const { progress, totalVideosLengthDone } = await getProgressOfCourseV2(listSectionOfCurrentCourse, lessonsRes, lessonDoneRes, currentUserId);
        // studyTime += totalVideosLengthDone || 0;
        if (currentUserProgress === 1) {
          completedCourses.push(course);
        }
        
      }
      const totalCourseOfCurrentUser = listCourseOfCurrentUser.length
      const numberOfCompletedCourse = completedCourses.length
      const numberOfInCompletedCourse = totalCourseOfCurrentUser - numberOfCompletedCourse
      const userReportItem: UserReportItem = {
        _id: user._id,
        name: user.name,
        role: user.role,
        registered: moment(user.createdAt).format("DD/MM/YYYY"),
        lastLogin: moment(user.lastLogin).format("DD/MM/YYYY"),
        lastEnrollment: lastEnrollment && moment(lastEnrollment).format("DD/MM/YYYY"), // TODO: LATER
        studyTime: studyTime, // TODO: LATER
        allCourses: totalCourseOfCurrentUser,
        completedCourses: numberOfCompletedCourse,
        inCompletedCourses: numberOfInCompletedCourse,
        certificates: numberOfCompletedCourse,
        avgScore: 0,
      };

      result.push(userReportItem);
    }

    res.status(200).json({
      message: "Successfully to get reports of user progress",
      reports: result,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch reports of user progress", 422);
      return next(customError);
    }
  }
};

export const getReportsCourseInsights = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {

  const dateStart = req.query.dateStart as string; // Replace with your start date
  const dateEnd = req.query.dateEnd as string;   // Replace with your end date
  const authorId = req.query.authorId as string;   // Replace with your end date

  try {
    // SHOULD BE OPIMIZE PERFORMANCE FOR WEBSITE ABOUT REPORT!
    const courseQuery: any = {
      // createdBy: req.query.authorId,
    }
    const reviewQuery: any = {}
    const wishlistQuery: any = {}

    const orderQuery: any = {};

    if(dateStart && dateEnd) {
      orderQuery.createdAt = {
        $gte: moment(dateStart, 'DD/MM/YYYY').toDate(), 
        $lte: moment(dateEnd, 'DD/MM/YYYY').toDate()
    }
      reviewQuery.createdAt = {
        $gte: moment(dateStart, 'DD/MM/YYYY').toDate(), 
        $lte: moment(dateEnd, 'DD/MM/YYYY').toDate()
    }
      wishlistQuery.createdAt = {
        $gte: moment(dateStart, 'DD/MM/YYYY').toDate(), 
        $lte: moment(dateEnd, 'DD/MM/YYYY').toDate()
    }
    }

    if(req.userId && req.role === enumData.UserType.Author.code) {
      courseQuery.createdBy = req.userId
    }

    if(authorId) {
      courseQuery.createdBy = authorId
    }

    const courses = await Course.find(courseQuery).populate('createdBy');

    const results: CourseReportItem[] = [];

    // filter condition
    const dictUsersOfCourse: Record<string, any> = {}
    const dictOrdersOfUser: Record<string, any> = {}
    const dictLessonsDoneOfUser: Record<string, any> = {}
    const dictSectionOfCourse: Record<string, any> = {}
    const dictLessonsOfCourse: Record<string, any> = {}
    const dictLessonsOfSection: Record<string, any> = {}
    const dictWishlistOfCourse: Record<string, any> = {}
    const dictReviewsOfCourse: Record<string, any> = {}
    // dict lessons of course

    const lessonDoneRes = await IsLessonDone.find().populate('lessonId');
    const courseRes = await Course.find();
    const sectionsRes = await Section.find();
    const lessonsRes = await Lesson.find();
    const ordersRes = await Order.find(orderQuery);
    const wishlistRes = await Wishlist.find({
      isDeleted: false,
      ...wishlistQuery
    });

    const reviewsRes = await Review.find(reviewQuery);

    wishlistRes.forEach((item) => {
      if(item.courseId) {
        const currentKey = item.courseId.toString();
        if (dictWishlistOfCourse[currentKey]) {
          dictWishlistOfCourse[currentKey].push(item)
        } else {
          dictWishlistOfCourse[currentKey] = [item]
        }
      }
    })

    const orderDetails = ordersRes.flatMap((order) => {
      return order.items.map((item: any) => ({
        orderId: order._id, 
        userId: order.user._id,
        userEmail: order.user.email,
        // ... other relevant order fields if needed
    
        courseId: item._id,
        courseName: item.name,
        courseThumbnail: item.thumbnail,
        coursePrice: item.finalPrice,
        reviewed: item.reviewed,
      }));
    });
    // create dict courses of user
    orderDetails.forEach((item) => {
      if(item.courseId) {
        if (dictUsersOfCourse[item.courseId]) {
          dictUsersOfCourse[item.courseId].push(item)
        } else {
          dictUsersOfCourse[item.courseId] = [item]
        }
      }

    })
    // create dict orders of user
    ordersRes.forEach((item) => {
      if(item.user) {
        const currentKey = item.user._id.toString();
        if (dictOrdersOfUser[currentKey]) {
          dictOrdersOfUser[currentKey].push(item)
        } else {
          dictOrdersOfUser[currentKey] = [item]
        }
      }
    })
    // create dict lessons of section
    lessonsRes.forEach((item) => {
      const currentKey = item.sectionId.toString()
      if(dictLessonsOfSection[currentKey]) {
        dictLessonsOfSection[currentKey].push(item)
      } else {
        dictLessonsOfSection[currentKey] = [item]
      }
    })

    // Group lesson done by userId (create dict lessons of of user and lesson)
    lessonDoneRes.forEach((item: any) => {
      if(item._doc) {
        const currentKey = item.userId.toString() + item.lessonId?._id?.toString();
        const currentValue = {
          ...item._doc,
          lesson: item._doc?.lessonId
        }
        dictLessonsDoneOfUser[currentKey] = currentValue
      }
    })

    // Group section by course id (dict sections of course)
    sectionsRes.forEach((item) => {
      if (item.courseId) {
        const currentKey = item.courseId.toString()
        if (dictSectionOfCourse[currentKey]) {
          dictSectionOfCourse[currentKey].push(item)
        } else {
          dictSectionOfCourse[currentKey] = [item]
        }
      }
    })

     // Group lesson by course id
     courseRes.forEach((courseItem) => {
      const courseId = courseItem._id.toString()
      const listSectionOfCourse = dictSectionOfCourse[courseId] as ISection[] ?? [];
      listSectionOfCourse.forEach((sectionItem) => {
          const listLessonOfSection = dictLessonsOfSection[sectionItem._id.toString()] ?? [];
          listLessonOfSection.forEach((lessonItem) => {
              if (dictLessonsOfCourse[courseId]) {
                dictLessonsOfCourse[courseId].push(lessonItem)
              } else {
                dictLessonsOfCourse[courseId] = [lessonItem]
              }
          })
      })
    })
     
    reviewsRes.forEach((reviewItem) => {
      if(reviewItem.courseId) {
        const currentKey = reviewItem.courseId.toString();
        if (dictReviewsOfCourse[currentKey]) {
          dictReviewsOfCourse[currentKey].push(reviewItem)
        } else {
          dictReviewsOfCourse[currentKey] = [reviewItem]
        }
      }
    
    })


    for (const course of courses) {
      const currentCourseId = course._id.toString()
      const listUsersOfCurrentCourse = dictUsersOfCourse[currentCourseId] ?? [];
      const listLessonsOfCurrentCourse = dictLessonsOfCourse[currentCourseId] ?? [];
      const listWishlistOfCurrentCourse = dictWishlistOfCourse[currentCourseId] ?? [];
      const listReviewsOfCurrentCourse = dictReviewsOfCourse[currentCourseId] ?? [];
      // const courseInfo = await getCourseDetailInfo(course._id);

      // const studentsOfCourse = learners.map((student) => student.user);

      const totalVideoLength = listLessonsOfCurrentCourse.reduce((total, lesson) => total + lesson.videoLength, 0);

      let totalStudyTime = 0;
      for (const user of listUsersOfCurrentCourse) {
        const currentUserId = user.userId.toString();
        const listLessonOfCurrentCourse = dictLessonsOfCourse[course._id.toString()] ?? [];
        const listLessonDone = []
        for (const lessonItem of listLessonOfCurrentCourse) {
          if(dictLessonsDoneOfUser[currentUserId + lessonItem._id.toString()]) {
            const lessonDone = dictLessonsDoneOfUser[currentUserId + lessonItem._id.toString()];
            if(lessonDone) {
              totalStudyTime += lessonDone?.lesson?.videoLength ?? 0;
              listLessonDone.push(lessonDone);
            }
          }
        }

        let currentUserProgress = 0; 
        if(listLessonOfCurrentCourse.length > 0) {
          currentUserProgress = listLessonDone.length / listLessonOfCurrentCourse.length
        }
        
        // const { totalVideosLengthDone } = await getProgressOfCourse(course._id, student._id);
        // totalStudyTime += totalVideosLengthDone;
      }

      let avgStudyTime = 0;
      if(listUsersOfCurrentCourse.length > 0) {
        avgStudyTime = totalStudyTime / listUsersOfCurrentCourse.length;
      }
      let avgRatings = 0;
      if(listReviewsOfCurrentCourse.length > 0) {
        avgRatings = listReviewsOfCurrentCourse.reduce((total, review) => total + (review?.ratingStar || 0), 0) / listReviewsOfCurrentCourse.length
      }
      const saleOfCurrentCourse = listUsersOfCurrentCourse.reduce((total, user) => total + (user?.coursePrice || 0), 0);
      const courseReportItem: CourseReportItem = {
        _id: course._id,
        author: course?.createdBy?.name,
        name: course.name,
        learners: listUsersOfCurrentCourse.length,
        avgStudyTime: avgStudyTime, // TODO LATER
        views: course.views,
        socialInteractions: 0,
        totalVideosLength: totalVideoLength, // TODO LATER
        lessons: listLessonsOfCurrentCourse.length,
        numberOfWishlist: listWishlistOfCurrentCourse.length,
        numberOfRatings: listReviewsOfCurrentCourse.length,
        avgRatings: avgRatings,
        saleOfCourse: saleOfCurrentCourse
      };

      results.push(courseReportItem);
    }

    res.status(200).json({
      message: "Successfully to get reports of course insights",
      reports: results,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch reports of course insights", 422);
      return next(customError);
    }
  }
};

export const getCoursesReportByAuthor = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const dateStart = new Date(req.query.dateStart as string); // Replace with your start date
  const dateEnd = new Date(req.query.dateEnd as string);   // Replace with your end date
  
  // Ensure dates start at the beginning and end of the day for accuracy
  dateStart.setHours(0, 0, 0, 0);
  dateEnd.setHours(23, 59, 59, 999); 
  const dictReviewsOfCourse: Record<string, any> = {}
  const dictCourse: Record<string, any> = {}
  
  try {
    const courseQuery: any = {};
    const orderQuery: any = {};
    // Filter by Author!
    if(req.role && req.role === enumData.UserType.Author.code) {
       courseQuery.createdBy = new mongoose.Types.ObjectId(req.userId) as any;
    } 
    // Filter by from date start to date end
    if(req.body.dateStart && req.body.dateEnd) {
      orderQuery.createdAt = {
        $gte: dateStart,
        $lte: dateEnd
      }
    }
    const reviewsRes = await Review.find();
    const ordersRes = await Order.find(orderQuery);
    const orderDetails = ordersRes.flatMap((order) => {
      return order.items.map((item: any) => ({
        orderId: order._id, 
        userId: order.user._id,
        userEmail: order.user.email,
        // ... other relevant order fields if needed
    
        courseId: item._id,
        courseName: item.name,
        courseThumbnail: item.thumbnail,
        coursePrice: item.finalPrice,
        reviewed: item.reviewed,
      }));
    });

    reviewsRes.forEach((reviewItem) => {
      if(reviewItem.courseId) {
        const currentKey = reviewItem.courseId.toString();
        if (dictReviewsOfCourse[currentKey]) {
          dictReviewsOfCourse[currentKey].push(reviewItem)
        } else {
          dictReviewsOfCourse[currentKey] = [reviewItem]
        }
      }
    })

    orderDetails.forEach((item) => {
      if (item.courseId) {
        if (dictCourse[item.courseId]) {
          dictCourse[item.courseId].push(item)
        } else {
          dictCourse[item.courseId] = [item]
        }
      }
    })

    // SHOULD BE OPIMIZE PERFORMANCE FOR WEBSITE ABOUT REPORT!
    const courses: any = await Course.find(courseQuery);
    
    
    const results: any = courses.map((courseItem) => {
      const currentCourseId = courseItem._id.toString()

      const learners = dictCourse[currentCourseId]?.length ?? 0;
      const listReviewsOfCurrentCourse = dictReviewsOfCourse[currentCourseId] ?? [];
      let totalEarnings: number = dictCourse[currentCourseId]?.reduce((total: number, item: any) => {
        return total + item?.coursePrice ?? 0
      }, 0) ?? 0

      if(req.role && req.role === enumData.UserType.Author.code) {
        totalEarnings = totalEarnings * enumData.SettingString.REVENUE_RATING_AUTHOR.value
      }
      const avgRatings = listReviewsOfCurrentCourse.reduce((total, review) => total + review.ratingStar, 0) / listReviewsOfCurrentCourse.length

      return {
        courseName: courseItem.name,
        createdAt: courseItem.createdAt,
        status: courseItem.status,
        learners: learners,
        totalEarnings: totalEarnings.toFixed(2),
        avgRatings,
        numberOfRatings: listReviewsOfCurrentCourse.length
      };
    });

    res.status(200).json({
      message: "Successfully to get courses report by author!",
      reports: results,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to get courses report by author!", 422);
      return next(customError);
    }
  }
};