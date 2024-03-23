import { Schema, model } from "mongoose";
import baseSchema from "./BaseSchema";
import { IFeedbackReply } from "../types/feedback.type";

const feedbackReplySchema = new Schema<IFeedbackReply>(
  {
    code: {
      type: String,
      required: true,
    },
    feedbackId: {
      type: Schema.Types.ObjectId,
      ref: "Feedback",
      required: true,
    },
    contentReply: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

feedbackReplySchema.add(baseSchema);

const FeedbackReply = model<IFeedbackReply>("Feedback_Reply", feedbackReplySchema);

export default FeedbackReply;
