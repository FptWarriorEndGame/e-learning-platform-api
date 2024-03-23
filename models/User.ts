import { Schema, model } from "mongoose";
import baseSchema from "./BaseSchema";
import { IUser } from "../types/user.type";

const userSchema = new Schema<IUser>(
  {
    code: {
      type: String,
    },
    providerId: {
      type: "string",
      default: "local",
    },
    name: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default:
        "https://lwfiles.mycourse.app/64b5524f42f5698b2785b91e-public/avatars/thumbs/64c077e0557e37da3707bb92.jpg",
    },
    username: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
    },
    payment: {
      type: String,
      default: "COD",
    },
    lastLogin: {
      type: Date,
    },
    headline: {
      type: String,
    },
    biography: {
      type: String,
    },
    socials: 
      {
        website: {
          type: String,
        },
        twitter: {
          type: String,
        },
        facebook: {
          type: String,
        },
        linkedin: {
          type: String,
        },
        youtube: {
          type: String,
        },
      },
    language: {
      type: String,
      default: "en",
    },
    showProfile: {
      type: Boolean,
      default: true,
    },
    showCourses: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
    },
    resetToken: String,
    resetTokenExpiration: Date,
    loginToken: String,
    loginTokenExpiration: Date,
  },
  { timestamps: true }
);

userSchema.add(baseSchema);

userSchema.index({ name: "text", email: "text" });

const User = model<IUser>("User", userSchema);

export default User;
