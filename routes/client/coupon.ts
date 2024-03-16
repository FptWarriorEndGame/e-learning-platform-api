import { Router } from "express";
import * as couponController from "../../controllers/client/coupon";

const router = Router();

router.get("/valid-for-courses", couponController.getValidCouponsForCourses);

export default router;
