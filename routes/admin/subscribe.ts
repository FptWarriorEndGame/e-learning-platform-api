import { Router } from "express";
import uploadMiddleware from "../../middleware/upload";
import * as subscibeController from "../../controllers/admin/subscribe";
import isAuth from "../../middleware/is-auth";

const router = Router();

router.get("/getAll", subscibeController.getAllSubscribe);

router.get("/getSubriceById/:id", isAuth, subscibeController.getSubscriceById);

router.post("/create", isAuth, subscibeController.postSubscribe);

router.delete("/delete/:id", isAuth, subscibeController.deleteSubscribe);

export default router;
