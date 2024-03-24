import { Request, Response, NextFunction } from "express";
import User from "../../models/User";
import bcrypt from "bcryptjs";
import { getCoursesOrderByUserId } from "../../utils/helper";
import CustomError from "../../utils/error";
import CustomErrorMessage from "../../utils/errorMessage";
import { AuthorAuthRequest } from "../../middleware/is-auth";
import { enumData } from "../../config/enumData";
import {
  CREATE_SUCCESS,
  ERROR_CREATE_DATA,
  ERROR_GET_DATA,
  ERROR_GET_DATA_DETAIL,
  ERROR_GET_DATA_HISTORIES,
  ERROR_NOT_FOUND_DATA,
  ERROR_UPDATE_ACTIVE_DATA,
  ERROR_UPDATE_DATA,
  GET_DETAIL_SUCCESS,
  GET_HISOTIES_SUCCESS,
  GET_SUCCESS,
  UPDATE_ACTIVE_SUCCESS,
  UPDATE_SUCCESS,
} from "../../config/constant";
import mongoose, { ClientSession } from "mongoose";
import { coreHelper } from "../../utils/coreHelper";
import ActionLog from "../../models/ActionLog";
import { session } from "passport";
import { template } from "../../config/template";
import sendEmail from "../../utils/sendmail";
import Order from "../../models/Order";
import Course from "../../models/Course";

interface getUsersQuery {
  $text?: {
    $search: string;
  };
  createdBy?: string;
}

export const getUsers = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const { _q } = req.query;
  const dictCoursesOfUser: Record<string, any> = {};
  const dictCourse: Record<string, any> = {};
  try {
    const query: getUsersQuery = {};
    const orderQuery: any = {};
    if (req.role && req.role === enumData.UserType.Author.code) {
      query.createdBy = new mongoose.Types.ObjectId(req.userId) as any;
    }

    if (_q && typeof _q === "string") {
      query.$text = { $search: _q };
    }

    const ordersRes = await Order.find(orderQuery);
    const courseRes = await Course.find();
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
          dictCoursesOfUser[item.userId].push(item);
        } else {
          dictCoursesOfUser[item.userId] = [item];
        }
      }
    });

    // create dict course
    courseRes.forEach((item) => {
      const currentKey = item._id.toString();
      dictCourse[currentKey] = item;
    });

    const users = await User.find(query).sort({ createdAt: -1 });

    const result = [];
    users.forEach((user) => {
      const currentUserId = user._id.toString();
      const listCoursesRes = [];
      const listCourse = dictCoursesOfUser[currentUserId];
      // Trường hợp đã có order
      if (listCourse) {
        const listCourseId = listCourse.map((item) => item.courseId.toString());
        const listCourseIdDistinct = [...new Set<string>(listCourseId)];
        listCourseIdDistinct.forEach((courseId) => {
          if (dictCourse[courseId]) {
            listCoursesRes.push(dictCourse[courseId]);
          }
        });
        const item = {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          phone: user.phone,
          address: user.address,
          payment: user.payment,
          courses: listCoursesRes,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLogin: user.lastLogin,
          isDeleted: user.isDeleted,
          statusName: enumData.UserStatus[user.status]?.name,
          statusColor: enumData.UserStatus[user.status]?.color,
          status: user.status,
        };
        result.push(item);
      }else {
        // Trường hợp chưa có order (khoá học mới!)
        const item = {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          phone: user.phone,
          address: user.address,
          payment: user.payment,
          courses: [],
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLogin: user.lastLogin,
          isDeleted: user.isDeleted,
          statusName: enumData.UserStatus[user.status]?.name,
          statusColor: enumData.UserStatus[user.status]?.color,
          status: user.status,
        };
        result.push(item);
      }
    });

    res.status(200).json({
      message: "Fetch users sucessfully!",
      users: result,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch users!", 422);
      return next(customError);
    }
  }
};

export const getUsersSelectBox = async (req: Request, res: Response, next: NextFunction) => {

  const userQuery: any = {}
  if(req.query.role) {
    userQuery.role = req.query.role
  }

  try {
    const users = await User.find(userQuery).select("_id name");

    const result = users.map((user) => {
      return {
        value: user._id,
        label: user.name,
      };
    });

    res.status(200).json({
      message: "Fetch users sucessfully!",
      users: result,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch users!", 422);
      return next(customError);
    }
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    res.status(200).json({
      message: "fetch single user successfully!",
      user,
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

export const postUser = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const { name, email, phone, password, role, status, username } = req.body;

  let avatar;

  if (req.file) {
    avatar = req.file.path;
  } else {
    avatar =
      "https://lwfiles.mycourse.app/64b5524f42f5698b2785b91e-public/avatars/thumbs/64c077e0557e37da3707bb92.jpg";
  }

  let session: ClientSession | null = null;
  session = await mongoose.startSession();
  session.startTransaction();

  try {
    const UserCode = await coreHelper.getCodeDefault("USER", User);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new CustomError("Email", "Email is already registered", 422);
      return next(error);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      code: UserCode,
      email,
      name,
      phone,
      avatar: avatar,
      role,
      password: hashedPassword,
      createdBy: req.userId,
      status: status ? status : enumData.UserStatus.NEW.code,
      username: username
    });

    const result = await newUser.save();

    const historyItem = new ActionLog({
      referenceId: result._id,
      type: enumData.ActionLogEnType.Create.code,
      createdBy: new mongoose.Types.ObjectId(req.userId),
      functionType: "User",
      description: `User [${name}] has [${enumData.ActionLogEnType.Create.name}] action by user [${req.userId}]`,
    });

    await ActionLog.collection.insertOne(historyItem.toObject(), { session });
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "User created successfully!",
      userId: result._id,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to created user!", 422);
      return next(customError);
    }
  }
};

/** Approve and send email (with username and password for new author) */
export const approveUser = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const { userId } = req.body;
  let session: ClientSession | null = null;
  session = await mongoose.startSession();
  session.startTransaction();

  try {
    const foundUser = await User.findOne({ _id: userId });

    if (!foundUser) {
      throw new Error(`User ${userId} not found`);
    }

    foundUser.status = enumData.UserStatus.ACTIVE.code;

    const result = await foundUser.save();

    const createdBy = new mongoose.Types.ObjectId(req.userId) as any;
    const historyDesc = `User [${(req as any).username}] has [APPROVED] User`;
    const functionType = "USER";

    const historyItem = new ActionLog({
      questionId: result._id,
      type: functionType,
      createdBy,
      functionType,
      description: historyDesc,
    });

    await ActionLog.collection.insertOne(historyItem.toObject(), {
      session: session,
    });

    const bodyHtml = template.EmailTemplate.SendUserNameAndPasswordForAuthor.default
      .replace("{0}", foundUser.name) // Replace {0} with the user's name
      .replace("{1}", foundUser.username) // Replace {1} with the user's username
      .replace("{2}", "123456"); // Replace {2} with the generated or default password
    await sendEmail({
      from: template.EmailTemplate.SendUserNameAndPasswordForAuthor.from,
      to: foundUser.email,
      subject: template.EmailTemplate.SendUserNameAndPasswordForAuthor.name,
      html: bodyHtml,
    });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "User created successfully!",
      userId: result._id,
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    } else {
      const customError = new CustomErrorMessage("Failed to created user!", 422);
      return next(customError);
    }
  }
};

export const updateUser = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const { name, email, phone, role } = req.body;
  const { userId } = req.params;

  let avatar;

  if (req.file) {
    avatar = req.file.path;
  } else {
    avatar =
      "https://lwfiles.mycourse.app/64b5524f42f5698b2785b91e-public/avatars/thumbs/64c077e0557e37da3707bb92.jpg";
  }

  let session: ClientSession | null = null;
  session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedUser = await User.findById(userId);

    if (!updatedUser) {
      const error = new CustomError("User", ERROR_NOT_FOUND_DATA, 404);
      throw error;
    }

    updatedUser.name = name;
    updatedUser.email = email;
    updatedUser.phone = phone;
    updatedUser.role = role;
    updatedUser.avatar = avatar;

    updatedUser.updatedAt = new Date();
    updatedUser.updatedBy = new mongoose.Types.ObjectId(req.userId) as any;

    const response = await updatedUser.save();

    const historyItem = new ActionLog({
      UserId: response._id,
      type: enumData.ActionLogEnType.Update.code,
      createdBy: new mongoose.Types.ObjectId(req.userId) as any,
      functionType: "User",
      description: `User [${req.username}] has [${enumData.ActionLogEnType.Update.name}] User`,
    });

    await ActionLog.collection.insertOne(historyItem.toObject(), { session });
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Update user succesfully!",
      user: response,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to update user!", 422);
      return next(customError);
    }
  }
};

export const updateActiveStatusUser = async (
  req: AuthorAuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.body;

  let session: ClientSession | null = null;
  session = await mongoose.startSession();
  session.startTransaction();

  try {
    const foundUser = await User.findById(userId);

    if (!foundUser) {
      const error = new CustomError("User", ERROR_NOT_FOUND_DATA, 404);
      throw error;
    }

    foundUser.isDeleted = !foundUser.isDeleted;
    foundUser.updatedAt = new Date();
    foundUser.updatedBy = new mongoose.Types.ObjectId(req.userId) as any;
    await foundUser.save();
    const type =
      foundUser.isDeleted === false
        ? `${enumData.ActionLogEnType.Activate.code}`
        : `${enumData.ActionLogEnType.Deactivate.code}`;
    const typeName =
      foundUser.isDeleted === false
        ? `${enumData.ActionLogEnType.Activate.name}`
        : `${enumData.ActionLogEnType.Deactivate.name}`;
    const createdBy = new mongoose.Types.ObjectId(req.userId) as any;
    const historyDesc = `User [${req.username}] has [${typeName}] User`;
    const functionType = "User";

    const historyItem = new ActionLog({
      userId: foundUser._id,
      type,
      createdBy,
      functionType,
      description: historyDesc,
    });

    await ActionLog.collection.insertOne(historyItem.toObject(), {
      session: session,
    });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: UPDATE_ACTIVE_SUCCESS,
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage(ERROR_UPDATE_ACTIVE_DATA, 422);
      return next(customError);
    }
  }
};

export const loadHistoriesUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  try {
    const page = parseInt(req.query._page as string) || 1;
    const limit = parseInt(req.query._limit as string) || 10;
    const skip = (page - 1) * limit;

    const [results, count] = await Promise.all([
      ActionLog.find({ userId: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ActionLog.countDocuments({ userId: userId }),
    ]);

    res.status(200).json({
      message: GET_HISOTIES_SUCCESS,
      results: results,
      count,
      page,
      pages: Math.ceil(count / limit),
      limit,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage(ERROR_GET_DATA_HISTORIES, 422);
      return next(customError);
    }
  }
};

export const changePassword = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const { userId, oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error changing password" });
  }
};
