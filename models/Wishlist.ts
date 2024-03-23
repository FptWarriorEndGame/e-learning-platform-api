import { Schema, model } from "mongoose";
import baseSchema from "./BaseSchema";
import { IWishlist } from "../types/wishlist.type";

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

wishlistSchema.add(baseSchema);

const Wishlist = model<IWishlist>("Wishlist", wishlistSchema);

export default Wishlist;
