import express from "express";
import * as discussCourseController from "../../controllers/client/courseDiscuss";

const router = express.Router();

// Route to get all discussions
router.get("/getAll", discussCourseController.getAllDiscurdCourse);

// Route to get discussions by lessonId
router.get("/lesson/:lessonId", discussCourseController.getDiscussByLessonId);

router.get("/section/:sectionId", discussCourseController.getDiscussByLessonId);

router.get("/discuss/:id", discussCourseController.getDiscussById);

// Route to add a discussion
router.post("/add", discussCourseController.addDiscussCourse);

router.post("/reply", discussCourseController.addRelyToDisCuss);

// Route to update a discussion
router.put("/update/:discussId", discussCourseController.updateDiscussCourse);

router.delete("/delete/:discussId", discussCourseController.deleteDiscuss);

export default router;
