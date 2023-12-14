
const express = require("express");
const router = express.Router();
const coursesController = require("../controllers/userCourses")

// GET Courses by User
router.get('/coursesByUser/:userId', coursesController.getCoursesByUser);
router.get('/wishlistcoursesByUser/:userId', coursesController.getCoursesWishlistByUser);

module.exports = router;
    