import { Router } from "express";
import * as subscribeController from "../../controllers/admin/subscribe";

const router = Router();

router.get("/getAll", subscribeController.getAllSubscribe);

router.get("/getSubriceById/:id", subscribeController.getSubscriceById);

router.post("/create", subscribeController.postSubscribe);

router.delete("/delete/:id", subscribeController.deleteSubscribe);

export default router;
