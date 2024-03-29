import { Request, Response, NextFunction } from "express";
import Blog from "../../models/Blog";
import mongoose from "mongoose";
import CustomErrorMessage from "../../utils/errorMessage";
import { AuthorAuthRequest } from "../../middleware/is-auth";

export const getAllBlog = async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const author = req.query.author as string;
  const categoryId = req.query.categoryId as string;
  const title = req.query.title as string;

  try {
    const blogs = await Blog.find({
      ...(author ? { author: author } : {}),
      ...(categoryId ? { categoryId: categoryId } : {}),
      ...(author ? { author: { $regex: author, $options: "i" } } : {}),
      ...(title ? { title: { $regex: title, $options: "i" } } : {}),
      isDeleted: { $ne: true },
    })
      .populate("categoryId", "name")
      .skip(skip)
      .sort({ createdAt: -1 })
      .limit(limit);
    const total = await Blog.countDocuments({
      ...(author ? { author: author } : {}),
      ...(categoryId ? { categoryId: categoryId } : {}),
      isDeleted: { $ne: true },
    });

    res.status(200).json({
      message: "Get all blogs successfully",
      blogs: blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error: any) {
    next(error);
  }
};

export const createBlog = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const { title, author, blogImg, technology, tags, readTime, content, userId, categoryId } =
    req.body;

  if (
    !title ||
    !author ||
    !blogImg ||
    !technology ||
    !tags ||
    !readTime ||
    !content ||
    !userId ||
    !categoryId
  ) {
    return next(new CustomErrorMessage("Missing required fields", 400));
  }

  try {
    const blogPost = new Blog({
      title,
      author,
      blogImg,
      technology,
      tags: Array.isArray(tags) ? tags : tags.split(",").map((tag) => tag.trim()),
      readTime,
      content,
      userId,
      categoryId,
      datePublished: new Date(),
      isDeleted: false,
      createdBy: req.userId,
    });

    await blogPost.save();

    res.status(201).json({
      message: "Blog post created successfully",
      blogPost,
    });
  } catch (error) {
    next(error);
  }
};

export const getBlogById = async (req: Request, res: Response, next: NextFunction) => {
  const blogId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(blogId)) {
    return res.status(400).json({ message: "Invalid blog ID" });
  }
  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      const error = new CustomErrorMessage("Could not find blog", 422);
      throw error;
    }
    res.status(200).json({
      message: "Get blog successfully",
      blog: blog,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  const { title, author, blogImg, technology, tags, readTime, content, userId, category } =
    req.body;
  const { id } = req.params;
  try {
    // Find the blog post by id and update it
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        title,
        author,
        blogImg,
        technology,
        tags,
        readTime,
        content,
        userId,
        category,
      },
      { new: true }
    );
    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    updatedBlog.updatedAt = new Date();
    updatedBlog.updatedBy = new mongoose.Types.ObjectId(req.userId) as any;
    res.json(updatedBlog);
  } catch (err) {
    next(err);
  }
};

export const deleteBlogById = async (req: Request, res: Response, next: NextFunction) => {
  const blogId = req.params.id;
  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      const error = new CustomErrorMessage("Could not find blog", 422);
      error.statusCode = 404;
      throw error;
    }
    await Blog.findByIdAndRemove(blogId);
    res.status(200).json({
      message: "Delete blog successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const softDeleteBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json(blog);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
