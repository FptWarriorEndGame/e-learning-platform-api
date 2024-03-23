import { Router } from "express";
import * as orderController from "../../controllers/admin/order";
import isAuth from "../../middleware/is-auth";

const router = Router();

router.get("/",  orderController.getOrders);

router.get("/order/:orderId", orderController.getOrder);

export default router;