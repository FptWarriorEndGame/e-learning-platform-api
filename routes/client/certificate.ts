import { Router } from "express";
import * as certificateController from "../../controllers/client/certificate";

const router = Router();

router.post("/certificate/generate", certificateController.postCertificate);

router.post("/certificate/generate/test", certificateController.testGenCertificate);

router.get("/certificate/get", certificateController.getCertificate);

export default router;
