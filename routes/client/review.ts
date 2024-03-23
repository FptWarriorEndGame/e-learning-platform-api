import { Router } from "express";
import * as reviewController from "../../controllers/client/review";
import isUserAuth from "../../middleware/is-user-auth";

const router = Router();

router.get("/course/:courseId", reviewController.getReviewsByCourseId);

router.get("/course/count/:courseId", reviewController.getTotalReviewsByCourseId);

router.get("/course/average-rating/:courseId", reviewController.getAverageRatingByCourseId);

router.get("/course/percentage-rating/:courseId", reviewController.getRatingPercentageByCourseId);

router.get("/review/replies/:reviewId", reviewController.getReviewRepliesByReviewId);

router.post("/review/create", isUserAuth, reviewController.postReview);

export default router;
