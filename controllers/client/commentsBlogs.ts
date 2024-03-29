import { Request, Response } from "express";
import BlogComment from "../../models/BlogComment"; // Giả sử đường dẫn đến model BlogComment
import { coreHelper } from "../../utils/coreHelper";

export const getAllCommentsFromMultipleBlogs = async (req: Request, res: Response) => {
  try {
    const comments = await BlogComment.find()
      .populate("userId", "name avatar")
      .populate({
        path: "replies",
        populate: { path: "userId", select: "name avatar" },
      });

    res.json({ comments });
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const { content, userId, blogId, parentCommentId } = req.body;
    const blogCommentsCode = await coreHelper.getCodeDefault("BLOGCOMMENT", BlogComment);

    const newComment = new BlogComment({
      code: blogCommentsCode,
      content,
      userId,
      blogId,
      parentCommentId: parentCommentId || null,
      likes: [],
    });
    const savedComment = await newComment.save();

    res.status(201).json(savedComment);
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

export const getCommentsByBlogId = async (req: Request, res: Response) => {
  try {
    const { blogId } = req.params;
    const comments = await BlogComment.find({ blogId, parentCommentId: null }) // Fetch only parent comments
      .populate("userId", "name avatar")
      .populate({
        path: "replies",
        populate: { path: "userId", select: "name avatar" },
      });
    res.json({ comments });
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const updatedComment = await BlogComment.findByIdAndUpdate(
      commentId,
      { content },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json(updatedComment);
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;

    const deletedComment = await BlogComment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

export const toggleLikeComment = async (req: Request, res: Response) => {
  const { commentId, userId } = req.body;

  try {
    const comment = await BlogComment.findById(commentId);

    if (!comment) {
      return res.status(404).send("Comment not found");
    }

    const likeIndex = comment.likes.indexOf(userId);

    if (likeIndex === -1) {
      comment.likes.push(userId);
    } else {
      comment.likes.splice(likeIndex, 1);
    }

    const updatedComment = await comment.save();
    res.json(updatedComment);
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

export const addReplyToComment = async (req: Request, res: Response) => {
  const { content, userId, blogId, parentCommentId } = req.body;

  try {
    // Find the parent comment and ensure it exists
    const parentComment = await BlogComment.findById(parentCommentId);
    const blogCommentsCode = await coreHelper.getCodeDefault("BLOG_REPLY", BlogComment);

    if (!parentComment) {
      return res.status(404).json({ error: "Parent comment not found." });
    }

    // Create a new comment as a reply
    const newReply = new BlogComment({
      code: blogCommentsCode, 
      content,
      userId,
      blogId,
      parentCommentId,
    });

    // Save the new reply
    const savedReply = await newReply.save();

    parentComment.replies.push(savedReply._id);
    await parentComment.save();

    // Populate necessary fields for the response
    await savedReply.populate("userId", "name avatar");

    res.status(201).json(savedReply);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
