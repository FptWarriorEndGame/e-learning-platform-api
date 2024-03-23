const express = require("express");

import {
  addComment,
  addReplyToComment,
  deleteComment,
  getAllCommentsFromMultipleBlogs,
  getCommentsByBlogId,
  toggleLikeComment,
  updateComment,
} from "../../controllers/client/commentsBlogs";

const router = express.Router();

// Route để tạo một bình luận mới
router.post("/", addComment);

// Route để lấy tất cả bình luận của một bài viết
router.get("/:blogId", getCommentsByBlogId);

// Route để cập nhật một bình luận
router.put("/:commentId", updateComment);

// Route để xóa một bình luận
router.delete("/:commentId", deleteComment);

// Route để 'like' hoặc 'unlike' một bình luận
router.patch("/like", toggleLikeComment);

// Route để phản hồi bình luận
router.post("/reply", addReplyToComment);


export default router;
