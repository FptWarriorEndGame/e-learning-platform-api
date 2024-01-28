import { Router } from "express";
import categoryRouter from "./admin/category";
import courseRouter from "./admin/course";
import sectionRouter from "./admin/section";
import lessonRouter from "./admin/lesson";
import orderRouter from "./admin/order";
import userRouter from "./admin/user";
import blogRouter from "./admin/blog";
import feedbackRouter from "./admin/feedback";

const router = Router();

router.use("/categories", categoryRouter);

router.use("/courses", courseRouter);

router.use("/sections", sectionRouter);

router.use("/lessons", lessonRouter);

router.use("/orders", orderRouter);

router.use("/users", userRouter);

router.use("/blogs", blogRouter);

router.use("/feedbacks", feedbackRouter);

export default router;
