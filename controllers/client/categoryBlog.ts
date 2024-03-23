// controllers/categoryController.ts
import { Request, Response } from "express";
import BlogCategory from "../../models/BlogCategory";
import { ICategoryBlog } from "../../types/iCategoryBlog";

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories: ICategoryBlog[] = await BlogCategory.find();
    // Gói mảng các danh mục thành một đối tượng với thuộc tính blogsCategories
    const response = { blogsCategories: categories };
    res.json(response);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const categories = await BlogCategory.findById(id);
    if (!categories) {
      res.status(404).json({ message: "Category not found" });
      return;
    }
    const response = { blogCategories: categories };
    res.json(response);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const categories = req.body;
  try {
    const newCategory = await BlogCategory.create(categories);
    res.status(201).json({ blogCategories: newCategory });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const categories = req.body;
  try {
    const updatedCategory = await BlogCategory.findByIdAndUpdate(id, categories, {
      new: true,
    });
    if (!updatedCategory) {
      res.status(404).json({ message: "Category not found" });
      return;
    }
    res.json(updatedCategory);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const deleteCategoryById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const categories = await BlogCategory.findById(id);
    if (!categories) {
      res.status(404).json({ message: "Categories not found" });
      return;
    }
    await BlogCategory.findByIdAndRemove(id);
    res.status(200).json({
      message: "Delete category successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "An unknown error occurred" });
  }
};
