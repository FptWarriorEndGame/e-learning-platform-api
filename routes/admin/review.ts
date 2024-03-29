import { Router } from "express";
import * as reviewController from "../../controllers/admin/review";
import isAuth from "../../middleware/is-auth";

const router = Router();

router.get("/", isAuth, reviewController.getReviews);

router.get("/review/:reviewId",isAuth, reviewController.getReviewById);

router.get("/review/histories/:reviewId", isAuth, reviewController.loadHistoriesForReview);

router.patch("/review/update-active-status", isAuth, reviewController.updateActiveStatusReview);

router.post("/review/reply/create", isAuth, reviewController.postReviewReply);

router.get("/review/replies/:reviewId", reviewController.getReviewRepliesByReviewId);

router.patch(
  "/review/reply/update-active-status",
  isAuth,
  reviewController.updateActiveStatusReviewReply
);

export default router;
