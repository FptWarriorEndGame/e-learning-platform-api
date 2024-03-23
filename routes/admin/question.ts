import { Router } from "express";
import uploadMiddleware from "../../middleware/upload";
import * as questionController from "../../controllers/admin/question";
import isAuth from "../../middleware/is-auth";

const router = Router();

/** load question */
router.get("/", isAuth, questionController.getQuestions);

/** load detail single question */
router.get("/question/:questionId", isAuth, questionController.getQuestionById);

/** get histories of question */
router.get("/question/:questionId/histories", isAuth, questionController.loadHistories);

/** create data for question */
router.post("/question/create", isAuth, uploadMiddleware.array("images[]"), questionController.postQuestion);

/** Update a question */
router.put("/question/update", isAuth, uploadMiddleware.array("images[]"), questionController.updateQuestion);

/** Update active status question */
router.patch("/question/update_active_status", isAuth, uploadMiddleware.array("images[]"), questionController.updateActiveStatusQuestion);

export default router;
