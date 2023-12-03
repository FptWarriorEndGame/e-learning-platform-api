const mongoose = require("mongoose"); // Erase if already required

const Schema = mongoose.Schema;

// Declare the Schema of the Mongo model
const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      // index: true,
    },
    content: {
      type: String,
      default:
        "abcxyz",
    },
    userId: {
      // required: true,
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

blogSchema.index({ name: "text", email: "text" });

//Export the model
module.exports = mongoose.model("Blog", blogSchema);
