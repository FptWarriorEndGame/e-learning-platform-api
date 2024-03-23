import { Router } from "express";
import uploadMiddleware from "../../middleware/upload";
import * as sectionController from "../../controllers/admin/section";
import isAuth from "../../middleware/is-auth";

const router = Router();

router.get("/", isAuth, sectionController.getSections);

router.get("/course/:courseId", isAuth, sectionController.getSectionsByCourseId);

router.get("/section/:sectionId", isAuth, sectionController.getSection);

router.post(
  "/section/create",
  uploadMiddleware.array("images[]"),
  isAuth,
  sectionController.postSection
);

router.put("/section/update/:sectionId", isAuth, sectionController.updateSection);

export default router;
