import { Router } from "express";
import * as orderController from "../../controllers/client/order";

const router = Router();

router.get("/user/:userId", orderController.getOrdersByUserId);

router.get("/order/:orderId", orderController.getOrder);

router.post("/order/create", orderController.postOrder);

export default router;
