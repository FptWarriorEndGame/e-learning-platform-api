import { Router } from "express";
import * as feedbackController from "../../controllers/admin/feedback";
import isAuth from "../../middleware/is-auth";
const router = Router();

router.get("/", isAuth, feedbackController.getFeedbacks);

router.get("/feedback/:feedbackId", isAuth, feedbackController.getFeedbackById);

router.get("/feedback/histories/:feedbackId", isAuth, feedbackController.loadHistoriesForFeedback);

router.patch(
  "/feedback/update-active-status",
  isAuth,
  feedbackController.updateActiveStatusFeedback
);

router.post("/feedback/reply/create", isAuth, feedbackController.postFeedbackReply);

router.get("/feedback/replies/:feedbackId", feedbackController.getFeedbackRepliesByFeedbackId);

export default router;
