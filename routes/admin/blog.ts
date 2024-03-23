const express = require("express");
import { Router } from "express";
import * as blogController from "../../controllers/admin/blog";
import isAuth from "../../middleware/is-auth";
const router = Router();

// GET ALL BLOGS
router.get("/",isAuth, blogController.getAllBlog);

router.get("/blogParams", isAuth, blogController.getBlogPrams);

// GET a blog by id
router.get("/:id", isAuth, blogController.getBlogById);

router.get("/histories/:blogId", isAuth, blogController.loadHistoriesForBlog);

router.delete("/delete/:id",isAuth, blogController.deleteBlogById);

// POST a new blog
router.post("/create", isAuth, blogController.createBlog);

// UPDATE a blog by id
router.put("/update/:id", isAuth, blogController.updateBlog);

router.patch("/update-active-status", isAuth, blogController.updateActiveBlogStatus);

export default router;
