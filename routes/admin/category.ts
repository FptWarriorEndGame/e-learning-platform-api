import { Router } from "express";
import isAuth from "../../middleware/is-auth";
import isAdmin from "../../middleware/is-admin";
import uploadMiddleware from "../../middleware/upload";
import * as categoryController from "../../controllers/admin/category";

const router = Router();

router.get("/", isAuth, categoryController.getCategories);

router.get("/get-all", isAuth,categoryController.getAllCategories);

router.get("/category/:categoryId",isAuth, categoryController.getCategory);

router.post(
  "/category/create",
  isAuth,
  isAdmin,
  uploadMiddleware.single("cateImage"),
  categoryController.postCategory
);

router.put(
  "/category/update/:categoryId",
  isAuth,
  isAdmin,
  uploadMiddleware.single("cateImage"),
  categoryController.updateCategories
);

router.delete("/category/delete/:categoryId", isAuth, isAdmin, categoryController.deleteCategory);

export default router;
