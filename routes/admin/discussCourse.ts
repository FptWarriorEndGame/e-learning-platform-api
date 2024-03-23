import express from "express";
import * as discussCourseController from "../../controllers/admin/courseDiscuss";
import isAuth from "../../middleware/is-auth";

const router = express.Router();

router.get("/getdisscuss", isAuth, discussCourseController.getDiscuss);

// Route to get all discussions
router.get("/getAll", isAuth, discussCourseController.getAllDiscurdCourse);

// Route to get discussions by lessonId
router.get("/lesson/:lessonId", isAuth, discussCourseController.getDiscussByLessonId);

router.get("/section/:sectionId", isAuth, discussCourseController.getDiscussByLessonId);

router.get("/discuss/:id", isAuth, discussCourseController.getDiscussById);

router.get("/histories/:discussId", isAuth, discussCourseController.loadHistoriesForDiscuss);

router.post("/add", isAuth, discussCourseController.addDiscussCourse);

router.post("/reply", isAuth, discussCourseController.addReplyToDiscuss);

router.put("/update/:discussId", isAuth, discussCourseController.updateDiscussCourse);

router.delete("/delete/:discussId", isAuth, discussCourseController.deleteDiscuss);

router.patch("/update-active-status", isAuth, discussCourseController.updateActiveDiscuss);

export default router;
