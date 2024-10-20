import { Router } from "express";
import * as lessonController from "../../controllers/client/lesson";

const router = Router();

router.get("/section/:sectionId", lessonController.getLessonsBySectionId);

router.get(
  "/section/course-enrolled/:sectionId",
  lessonController.getLessonsBySectionIdEnrolledCourse
);

router.post("/lesson/done/:lessonId", lessonController.updateLessonDoneByUser);

router.get("/getAllLesson", lessonController.getAllLessons);

router.get("/course/:courseId/free-lessons", lessonController.getFreeLessonsByCourseId);

router.get("/course/:courseId/all-lessons", lessonController.getAllLessonsByCourseId);

router.get("/lesson/:lessonId/users", lessonController.getUsersByLessonId);

export default router;
