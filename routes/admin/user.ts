import { Router } from "express";
import isAuth from "../../middleware/is-auth";
import isAdmin from "../../middleware/is-admin";
import uploadMiddleware from "../../middleware/upload";
import * as userController from "../../controllers/admin/user";

const router = Router();

router.get("/", isAuth, isAdmin, userController.getUsers);

router.get("/select", isAuth, isAdmin, userController.getUsersSelectBox);

router.get("/user/:userId", isAuth, userController.getUser);

router.post(
  "/user/create",
  isAuth,
  isAdmin,
  uploadMiddleware.single("avatar"),
  userController.postUser
);

router.post("/user/change-password", isAuth, isAdmin, userController.changePassword);

router.patch("/user/approve", isAuth, isAdmin, userController.approveUser);

router.put(
  "/user/update/:userId",
  isAuth,
  isAdmin,
  uploadMiddleware.single("avatar"),
  userController.updateUser
);

router.patch("/user/update-active-status", isAuth, userController.updateActiveStatusUser);

router.get("/user/histories/:userId", isAuth, userController.loadHistoriesUser);

export default router;
