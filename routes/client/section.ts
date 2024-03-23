import { Router } from "express";
import * as sectionController from "../../controllers/client/section";

const router = Router();

router.get("/course/:courseId", sectionController.getSectionsByCourseId);

export default router;
