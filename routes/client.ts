import { NextFunction, Router, Request, Response } from "express";
import courseRouter from "./client/course";
import categoryRouter from "./client/category";
import userRouter from "./client/user";
import orderRouter from "./client/order";
import cartRouter from "./client/cart";
import sectionRouter from "./client/section";
import lessonRouter from "./client/lesson";
import certificateRouter from "./client/certificate";
import uploadRouter from "./client/upload";
import paymentRouter from "./client/payment";
import wishlistRouter from "./client/wishlist";
import blogCategory from "./client/blogCategory";
import reviewRouter from "./client/review";
import feedbackRouter from "./client/feedback";
import couponRouter from "./client/coupon";
import getIO from "../socket";
import blogRouter from "../routes/client/blog";
import commentsRouter from "../routes/client/commentsBlogs";
import noteRouter from "../routes/client/noteCourse";
import disscussRouter from "../routes/client/discussCourse";
import subscribe from "../routes/client/subscribe";

const router = Router();

// router.use("/", async (req: Request, res: Response, next: NextFunction) => {
//     const socketIO = getIO()
//     socketIO.emit('init', {
//         action: 'init',
//         data: 'Hello World'
//       });
//       res.status(200).json({
//         message: "Welcome to the app!"
//       })
// });

router.use("/courses", courseRouter);

router.use("/categories", categoryRouter);

router.use("/users", userRouter);

router.use("/orders", orderRouter);

router.use("/carts", cartRouter);

router.use("/sections", sectionRouter);

router.use("/lessons", lessonRouter);

router.use("/certificates", certificateRouter);

router.use("/uploads", uploadRouter);

router.use("/payments", paymentRouter);

router.use("/wishlists", wishlistRouter);

router.use("/blogCategory", blogCategory);

router.use("/feedbacks", feedbackRouter);

router.use("/reviews", reviewRouter);

router.use("/coupons", couponRouter);

router.use("/blog", blogRouter);

router.use("/comments", commentsRouter);

router.use("/note", noteRouter);

router.use("/discuss", disscussRouter);

router.use("/subscribe", subscribe);

export default router;
