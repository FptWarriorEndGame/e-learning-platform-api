import { Router } from "express";
import * as transactionController from "../../controllers/admin/transaction";
import isAuth from "../../middleware/is-auth";

const router = Router();

router.get("/", isAuth, transactionController.getTransactions);

export default router;
