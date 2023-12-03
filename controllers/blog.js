const { faker } = require("@faker-js/faker");
const Category = require("../models/Category");
const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const { deleteFile } = require("../utils/file");
const { validationResult } = require("express-validator");
const IsLessonDone = require("../models/IsLessonDone");
const User = require("../models/User");
const Order = require("../models/Order");
const { getProgressOfCourse, getCourseDetailInfo } = require("../utils/helper");

exports.getAll = async (req, res, next) => {

  console.log("req: ", "hello");

  // Get the current date
  res.status(200).json({
    message: "Successfully to get all blog",
    blog: "All Blogs",
  });
};
