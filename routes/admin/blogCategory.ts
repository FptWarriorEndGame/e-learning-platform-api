import * as categoryBlogController from "../../controllers/admin/categoryBlog";
import express, { Router } from "express";
import isAuth from "../../middleware/is-auth";
import uploadMiddleware from "../../middleware/upload";

const router = express.Router();

// Get all category blogs
router.get("/category-blogs", isAuth, categoryBlogController.getCategoryBlog);

// Get all active categories
router.get("/getAll", isAuth, categoryBlogController.getAllCategories);

// Get category by ID
router.get("/:id", isAuth, categoryBlogController.getCategoryById);

// Load histories for a category
router.get(
  "/histories/:blogCategoryTypeId",
  isAuth,
  categoryBlogController.loadHistoriesForCategoryBlog
);

// Create a new category
router.post(
  "/create",
  isAuth,
  uploadMiddleware.single("cateImage"),
  categoryBlogController.createCategory
);

// Update a category
router.put(
  "/update/:id",
  isAuth,
  uploadMiddleware.single("cateImage"),
  categoryBlogController.updateCategory
);

// Update active status of a category
router.patch(
  "/update-active-status",
  isAuth,
  categoryBlogController.updateActiveCategoryBlogStatus
);

export default router;
