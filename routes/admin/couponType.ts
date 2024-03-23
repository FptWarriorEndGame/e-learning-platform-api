import { Router } from "express";
import * as couponTypeController from "../../controllers/admin/couponType";
import isAuth from "../../middleware/is-auth";

const router = Router();

router.get("/", isAuth, couponTypeController.getCouponTypes);

router.get("/all-active", isAuth, couponTypeController.getAllActiveCouponTypes);

router.get("/coupon-type/:couponTypeId", isAuth, couponTypeController.getCouponTypeById);

router.get(
  "/coupon-type/histories/:couponTypeId",
  isAuth,
  couponTypeController.loadHistoriesForCouponType
);

router.post("/coupon-type/create", isAuth, couponTypeController.postCouponType);

router.put("/coupon-type/update", isAuth, couponTypeController.updateCouponType);

router.patch(
  "/coupon-type/update-active-status",
  isAuth,
  couponTypeController.updateActiveStatusCouponType
);

export default router;
