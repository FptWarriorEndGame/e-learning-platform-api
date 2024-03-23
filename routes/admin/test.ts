import { Router } from "express";
import uploadMiddleware from "../../middleware/upload";
import * as testController from "../../controllers/admin/test";
import isAuth from "../../middleware/is-auth";

const router = Router();

/** load test */
router.get("/",isAuth, testController.getTests);

/** load detail single test */
router.get("/test/:testId", isAuth,testController.getTestById);

/** get histories of test */
router.get("/test/:testId/histories", isAuth,testController.loadHistories);

/** create data for test */
router.post("/test/create",isAuth, uploadMiddleware.array("images[]"), testController.postTest);

/** Update a test */
router.put("/test/update",isAuth, uploadMiddleware.array("images[]"), testController.updateTest);

/** Update active status test */
router.patch("/test/update_active_status", isAuth,uploadMiddleware.array("images[]"), testController.updateActiveStatusTest);

export default router;
