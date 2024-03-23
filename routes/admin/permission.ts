import { Router } from "express";
import * as permissionController from "../../controllers/admin/permission";
import isAuth from "../../middleware/is-auth";

const router = Router();

router.get("/", isAuth, permissionController.getPermissions);

// router.get("/course/:courseId", isAuth, permissionController.getCourse);

router.put(
  "/update",
  isAuth,
  permissionController.updatePermission
);

// router.delete("/course/delete/:courseId", isAuth, permissionController.deleteCourse);

export default router;
