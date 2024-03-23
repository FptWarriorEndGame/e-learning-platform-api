import { Schema, model } from "mongoose";
import baseSchema from "./BaseSchema";
import { IPermission } from "../types/permission.type";

const permissionSchema = new Schema<IPermission>(
  {
    listPermission: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

permissionSchema.add(baseSchema);

// permissionSchema.index({ name: "text", description: "text" });

const Permission = model<IPermission>("Permission", permissionSchema);

export default Permission;
