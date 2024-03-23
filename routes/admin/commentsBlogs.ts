import express, { Router } from "express";

import * as blogCommentsController from "../../controllers/admin/commentsBlogs";
const router: Router = express.Router();
import isAuth from "../../middleware/is-auth";

// Route để tạo một bình luận mới
router.post("/create", blogCommentsController.addComment);

// Route để lấy tất cả bình luận của một bài viết
router.get("/getCommentsByBlogId/:blogId", isAuth, blogCommentsController.getCommentsByBlogId);

// Route để cập nhật một bình luận
router.put("/update/:commentId", isAuth, blogCommentsController.updateComment);

// Route để xóa một bình luận
router.delete("/:commentId", isAuth, blogCommentsController.deleteComment);

// Route để 'like' hoặc 'unlike' một bình luận
router.patch("/like", isAuth, blogCommentsController.toggleLikeComment);

// Route để phản hồi bình luận
router.post("/reply", isAuth, blogCommentsController.addReplyToComment);

// Route để lấy tất cả danh mục
router.get("/getAll", blogCommentsController.getAllBlogComments);

// Route để lấy tất cả bình luận của một bài viết (admin)
router.get("/getBlogParams/getBlogParams", isAuth, blogCommentsController.getCommentsBlog);

router.patch(
  "/update-active-status",
  isAuth,
  blogCommentsController.updateActiveCategoryBlogStatus
);

// Route để lấy lịch sử của một danh mục
router.get("/histories/:commentId", isAuth, blogCommentsController.loadHistoriesForCategoryBlog);

export default router;
