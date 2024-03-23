import { Router } from "express";
import * as certificateController from "../../controllers/client/certificate";

const router = Router();

router.post("/certificate/generate", certificateController.postCertificate);

router.get("/certificate/get", certificateController.getCertificate);

export default router;
