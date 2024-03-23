import { Router } from "express";
import uploadMiddleware from "../../middleware/upload";
import * as lessonController from "../../controllers/admin/lesson";
import isAuth from "../../middleware/is-auth";

const router = Router();

router.get("/", isAuth, lessonController.getLessons);

router.get("/section/:sectionId", isAuth, lessonController.getLessonsBySectionId);

router.get("/lesson/:lessonId", isAuth, lessonController.getLesson);

router.post(
  "/lesson/create",
  isAuth,
  uploadMiddleware.array("images[]"),
  lessonController.postLesson
);

router.put(
  "/lesson/update/:lessonId",
  isAuth,
  uploadMiddleware.array("images[]"),
  lessonController.updateLesson
);

export default router;
