import { Router } from "express";
import categoryRouter from "./admin/category";
import courseRouter from "./admin/course";
import sectionRouter from "./admin/section";
import lessonRouter from "./admin/lesson";
import orderRouter from "./admin/order";
import userRouter from "./admin/user";
import blogRouter from "./admin/blog";
import blogCategory from "./admin/blogCategory";
import feedbackRouter from "./admin/feedback";
import reportRouter from "./admin/report";
import transactionRouter from "./admin/transaction";
import reviewRouter from "./admin/review";
import couponRouter from "./admin/coupon";
import couponTypeRouter from "./admin/couponType";
import permissionRouter from "./admin/permission";
import questionRouter from "./admin/question";
import testRouter from "./admin/test";
import notesRouter from "./admin/noteCourse";
import commentsRouter from "./admin/commentsBlogs";
import discussRouter from "./admin/discussCourse";
import subscribe from "./admin/subscribe";

const router = Router();

router.use("/categories", categoryRouter);

router.use("/permissions", permissionRouter);

router.use("/courses", courseRouter);

router.use("/sections", sectionRouter);

router.use("/lessons", lessonRouter);

router.use("/orders", orderRouter);

router.use("/users", userRouter);

router.use("/transactions", transactionRouter);

router.use("/reviews", reviewRouter);

router.use("/blogs", blogRouter);

router.use("/blogCategory", blogCategory);

router.use("/feedbacks", feedbackRouter);

router.use("/reports", reportRouter);

router.use("/coupons", couponRouter);

router.use("/coupon-types", couponTypeRouter);

/** Question route */
router.use("/questions", questionRouter);

router.use("/note", notesRouter);

router.use("/comments", commentsRouter);
/** Test route */

router.use("/discuss", discussRouter);

router.use("/tests", testRouter);

router.use("/subscribe", subscribe);

export default router;
