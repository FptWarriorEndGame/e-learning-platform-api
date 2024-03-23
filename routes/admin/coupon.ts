import { Router } from "express";
import * as couponController from "../../controllers/admin/coupon";
import isAuth from "../../middleware/is-auth";

const router = Router();

router.get("/", isAuth, couponController.getCoupons);

router.get("/coupon/:couponId", isAuth, couponController.getCouponById);

router.get("/coupon/histories/:couponId", isAuth, couponController.loadHistoriesForCoupon);

router.post("/coupon/create", isAuth, couponController.postCoupon);

router.put("/coupon/update", isAuth, couponController.updateCoupon);

router.patch("/coupon/update-active-status", isAuth, couponController.updateActiveStatusCoupon);

export default router;
