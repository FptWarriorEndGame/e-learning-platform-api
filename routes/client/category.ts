import { Router } from "express";
import * as categoryController from "../../controllers/client/category";

const router = Router();

router.get("/", categoryController.getCategories);

router.get("/select", categoryController.getCategoriesSelect);

router.get("/category/:categoryId", categoryController.getCategory);

export default router;
