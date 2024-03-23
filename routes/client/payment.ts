import { Router } from "express";
import * as paymentController from "../../controllers/client/payment";

const router = Router();

router.post("/vnpay/create_vnpayment_url", paymentController.createVnpayUrl);
router.get("/vnpay/vnpay_return", paymentController.handleVnpayReturn);

export default router;
