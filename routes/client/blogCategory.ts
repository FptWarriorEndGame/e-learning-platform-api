// routes/category.ts

import {
  createCategory,
  deleteCategoryById,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "../../controllers/client/categoryBlog";
import express, { Router } from "express";

const router: Router = express.Router();

// Routes for Categories
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.post("/", createCategory);
router.put("/update/:id", updateCategory);
router.delete("/delete/:id", deleteCategoryById);

export default router;
