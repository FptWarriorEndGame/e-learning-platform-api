import { Router } from "express";
import * as userController from "../../controllers/client/user";
import upload from "../../middleware/upload";

const router = Router();

router.get("/authors", userController.getAuthors);

router.get("/authors/select", userController.getAuthorsSelect);

router.get("/user/:userId", userController.getUser);

router.put("/user/:userId", upload.single("avatar"), userController.updateUser);

router.get("/user/detail/:userId", userController.getUserDetail);

router.get("/user/public-profile/:userId", userController.getPublicProfile);

export default router;
