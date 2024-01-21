import { Router } from "express";
import isAuth from "../../middleware/is-auth";
import isAdmin from "../../middleware/is-admin";
import uploadMiddleware from "../../middleware/upload";
import * as userController from "../../controllers/admin/user";

const router = Router();

router.get("/", isAuth, isAdmin, userController.getUsers);

router.get("/user/:userId", isAuth, userController.getUser);

router.post(
  "/user/create",
  isAuth,
  isAdmin,
  uploadMiddleware.single("avatar"),
  userController.postUser
);

router.put(
  "/user/update/:userId",
  isAuth,
  isAdmin,
  uploadMiddleware.single("avatar"),
  userController.updateUser
);

router.delete("/user/delete/:userId", isAuth, isAdmin, userController.deleteUser);

export default router;