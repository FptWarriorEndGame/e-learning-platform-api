import { Request, Response, NextFunction } from "express";
import User from "../../models/User";
import { IUser } from "../../types/user.type";
import Course from "../../models/Course";
import { ICourse } from "../../types/course.type";
import Order from "../../models/Order";
import { BACKEND_URL } from "../../config/backend-domain";
import { getProgressOfCourse, getCoursesOrderByUserId } from "../../utils/helper";
import CustomError from "../../utils/error";
import CustomErrorMessage from "../../utils/errorMessage";
import { IDataSelect } from "../../types/dataSelect.type";
import IsLessonDone from "../../models/IsLessonDone";
import Section from "../../models/Section";
import Lesson from "../../models/Lesson";
import { ISection } from "../../types/section.type";

interface PublicProfileResponse {
  _id: any;
  name: string;
  avatar: string;
  headline: string;
  biography: string;
  website: string;
  twitter: string;
  facebook: string;
  linkedin: string;
  youtube: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
  courses?: ICourse[];
}

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select(
      "_id name avatar email phone headline biography website twitter facebook linkedin youtube language showProfile showCourses"
    );

    if (!user) {
      const error = new CustomError("User", "User not found", 404);
      throw error;
    }

    res.status(200).json({
      message: "Fetch single user successfully!",
      user: user,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch user!", 422);
      return next(customError);
    }
  }
};

export const getAuthors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courses: ICourse[] = await Course.find().populate("userId", "_id name");

    const authors: IUser[] = courses.map((course) => course.userId);

    const authorList = [
      ...new Map(
        authors.map((author) => {
          return [author.name, { name: author.name, _id: author._id }];
        })
      ),
    ];

    res.status(200).json({
      message: "Fetch authors successfully!",
      authors: authorList,
    });
  } catch (error) {
    console.log();

    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch authors!", 422);
      return next(customError);
    }
  }
};

export const getAuthorsSelect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courses: ICourse[] = await Course.find().populate("createdBy", "_id name");
    const authors: IDataSelect[] = courses.map((course) => {
      return {
        label: course?.createdBy?.name,
        value: course?.createdBy?._id.toString(),
      };
    });
    const dictAuthor = new Map<string, any>();
    authors.forEach((item) => {
      if (item.value !== undefined) {
        dictAuthor.set(item.value, item);
      }
    });

    const result = [...dictAuthor.values()];

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch authors!", 422);
      return next(customError);
    }
  }
};

export const getUserDetail = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const dictCoursesOfUser: Record<string, any> = {};
  const dictCourse: Record<string, any> = {};
  const dictLessonsDoneOfUser: Record<string, any> = {};
  const dictSectionOfCourse: Record<string, any> = {};
  const dictLessonsOfCourse: Record<string, any> = {};
  const dictLessonsOfSection: Record<string, any> = {};
  try {
    const user = await User.findById(userId);
    const courseRes = await Course.find({
      isDeleted: false,
    }).populate("userId");
    const ordersRes = await Order.find();
    const lessonDoneRes = await IsLessonDone.find().populate("lessonId");
    const sectionsRes = await Section.find();
    const lessonsRes = await Lesson.find();
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
    // Create dict for course
    courseRes.forEach((courseItem) => {
      const currentKey = courseItem._id.toString();
      dictCourse[currentKey] = courseItem;
    });

    // create dict courses of user
    orderDetails.forEach((item) => {
      if (item.userId) {
        if (dictCoursesOfUser[item.userId]) {
          dictCoursesOfUser[item.userId].push(item);
        } else {
          dictCoursesOfUser[item.userId] = [item];
        }
      }
    });
    // Found whether use have bought course ot not
    const listCourseOfUser = dictCoursesOfUser[userId];

    if (!listCourseOfUser) {
      return res.status(200).json({
        message: "Fetch user detail with fully data successfully!",
        user: {
          ...user.toObject(),
          courses: [],
        },
      });
    }

    // create dict lessons of section
    lessonsRes.forEach((item) => {
      const currentKey = item.sectionId.toString();
      if (dictLessonsOfSection[currentKey]) {
        dictLessonsOfSection[currentKey].push(item);
      } else {
        dictLessonsOfSection[currentKey] = [item];
      }
    });

    // Group lesson done by userId (create dict lessons of of user and lesson)
    lessonDoneRes.forEach((item: any) => {
      if (item._doc) {
        const currentKey = item.userId.toString() + item.lessonId?._id?.toString();
        const currentValue = {
          ...item._doc,
          lesson: item._doc?.lessonId,
        };
        dictLessonsDoneOfUser[currentKey] = currentValue;
      }
    });

    // Group section by course id (dict sections of course)
    sectionsRes.forEach((item) => {
      if (item.courseId) {
        if (dictSectionOfCourse[item.courseId.toString()]) {
          dictSectionOfCourse[item.courseId.toString()].push(item);
        } else {
          dictSectionOfCourse[item.courseId.toString()] = [item];
        }
      }
    });

    // Group lesson by course id
    courseRes.forEach((courseItem) => {
      const listSectionOfCourse =
        (dictSectionOfCourse[courseItem._id.toString()] as ISection[]) ?? [];
      listSectionOfCourse.forEach((sectionItem) => {
        const listLessonOfSection = dictLessonsOfSection[sectionItem._id.toString()] ?? [];
        listLessonOfSection.forEach((lessonItem) => {
          if (dictLessonsOfCourse[courseItem._id.toString()]) {
            dictLessonsOfCourse[courseItem._id.toString()].push(lessonItem);
          } else {
            dictLessonsOfCourse[courseItem._id.toString()] = [lessonItem];
          }
        });
      });
    });

    const listCourseIdOfUser = listCourseOfUser.map((item) => item.courseId.toString());
    const listCourseIdDistinctOfUser = [...new Set<string>(listCourseIdOfUser)];
    let studyTime = 0;
    const completedCourses = [];
    const listCourseResult = [];
    // List courses
    for (const courseId of listCourseIdDistinctOfUser) {
      // const currentCourseId = courseItem.courseId.toString();
      const currentInfoCourse = dictCourse[courseId];
      if (currentInfoCourse) {
        const listLessonOfCurrentCourse = dictLessonsOfCourse[courseId] ?? [];
        const listLessonDone = [];
        let currentUserStudyTime = 0;
        for (const lessonItem of listLessonOfCurrentCourse) {
          const currentLessonId = lessonItem._id.toString();
          if (dictLessonsDoneOfUser[userId + currentLessonId]) {
            const lessonDone = dictLessonsDoneOfUser[userId + currentLessonId];
            if (lessonDone) {
              studyTime += lessonDone?.lesson?.videoLength ?? 0;
              currentUserStudyTime += lessonDone?.lesson?.videoLength ?? 0;
              listLessonDone.push(lessonDone);
            }
          }
        }

        let currentUserProgress = 0;
        if (listLessonOfCurrentCourse.length > 0) {
          currentUserProgress = listLessonDone.length / listLessonOfCurrentCourse.length;
        }

        if (currentUserProgress === 1) {
          completedCourses.push(courseId);
        }

        const courseEnrolledItem = {
          ...currentInfoCourse._doc,
          progress: currentUserProgress,
          totalVideosLengthDone: currentUserStudyTime,
        };
        listCourseResult.push(courseEnrolledItem);
      }
    }

    const result = {
      ...user.toObject(),
      courses: listCourseResult,
    };

    res.status(200).json({
      message: "Fetch user fetail with fully data successfully!",
      user: result,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch user!", 422);
      return next(customError);
    }
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  let updateData = {
    ...req.body,
  };

  if (req.file) {
    updateData.avatar = `${BACKEND_URL}/${req.file.path}`;
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    res.status(200).json({
      message: "User updated successfully",
      userId: updatedUser._id,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to updated user!", 422);
      return next(customError);
    }
  }
};

export const getPublicProfile = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select(
      "_id name avatar email phone headline biography website twitter facebook linkedin youtube language showProfile showCourses createdAt updatedAt"
    );

    if (!user) {
      throw new CustomError("User", "User not found", 404);
    }

    if (!user.showProfile) {
      return res.status(403).json({
        message: "User has chosen not to show their profile.",
      });
    }

    let response: PublicProfileResponse = {
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      headline: user.headline,
      biography: user.biography,
      website: user.socials.website,
      twitter: user.socials.twitter,
      facebook: user.socials.facebook,
      linkedin: user.socials.linkedin,
      youtube: user.socials.youtube,
      language: user.language,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    if (user.showCourses) {
      const courses = await getCoursesOrderByUserId(user._id);
      response.courses = courses;
    }

    res.status(200).json({
      message: "Fetch single user publicly successfully!",
      user: response,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch public profile!", 422);
      return next(customError);
    }
  }
};

