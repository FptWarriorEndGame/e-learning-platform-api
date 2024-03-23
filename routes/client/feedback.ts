import { Router } from "express";
import * as feedbackController from "../../controllers/client/feedback";

const router = Router();

router.post("/feedback/create", feedbackController.createFeedback);

export default router;
