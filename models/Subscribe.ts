import { Schema, model } from "mongoose";
import baseSchema from "./BaseSchema";
import { ISubscribe } from "../types/subscribe.type";

const subscribe = new Schema<ISubscribe>(
  {
    code: { type: String, required: true },
    email: { type: String, required: true },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

subscribe.add(baseSchema);

const Subscribe = model<ISubscribe>("Subscribe", subscribe);

export default Subscribe;
