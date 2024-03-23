import { Router } from "express";
import isUserAuth from "../../middleware/is-user-auth";
import * as couponController from "../../controllers/client/coupon";

const router = Router();

router.get("/valid-for-courses", isUserAuth, couponController.getValidCouponsForCourses);

router.get(
  "/valid-for-courses-without-user",
  couponController.getValidCouponsForCoursesWithoutUser
);

export default router;
