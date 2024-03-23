import { Router } from "express";
import uploadVideoMiddleware from "../../middleware/uploadVideo";
import uploadPDFMiddleware from "../../middleware/uploadPDF";
import * as uploadController from "../../controllers/client/upload";

const router = Router();

router.post("/video", uploadVideoMiddleware.single("videoFile"), uploadController.uploadVideo);

router.post("/pdf", uploadPDFMiddleware.single("pdfFile"), uploadController.uploadPDF);

export default router;
