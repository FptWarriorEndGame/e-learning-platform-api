import { Schema, model } from "mongoose";
import baseSchema from "./BaseSchema";
import { IDiscuss } from "../types/discuss.type";

const discussSchema = new Schema<IDiscuss>(
  {
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    replies: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        contentReply: {
          type: String,
          required: true,
        },
        createdAt: {
          type: String,
          required: true,
        },
        updatedAt: {
          type: String,
        },
      },
    ],
    emotions: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: String,
          required: true,
        },
        updatedAt: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

discussSchema.add(baseSchema);

const Discuss = model<IDiscuss>("Discuss", discussSchema);

export default Discuss;
