import { Router } from "express";
import * as orderController from "../../controllers/admin/order";

const router = Router();

router.get("/", orderController.getOrders);

router.get("/order/:orderId", orderController.getOrder);

export default router;