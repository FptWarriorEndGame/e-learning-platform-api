import { Router } from "express";
import * as reportController from "../../controllers/admin/report";
import isAuth from "../../middleware/is-auth";

const router = Router();

// GET Summary reports
router.get("/summary", isAuth,reportController.getSummaryReports);

// GET Courses Sales
router.get("/course-sales", isAuth, reportController.getCourseSales);

// GET Revenue
router.get("/revenues", isAuth, reportController.getRevenues);

// GET NEW SIGNUPS
router.get("/new-signups", isAuth, reportController.getNewUserSignups);

// GET REPORTS FOR USER PROGRESS
router.get("/users-progress", isAuth, reportController.getReportsUserProgress);

// GET REPORTS FOR COURSE INSIGHTS
router.get("/course-insights", isAuth, reportController.getReportsCourseInsights);

// GET REPORTS FOR COURSES BY AUTHOR
router.get("/courses-report-by-author", isAuth, reportController.getCoursesReportByAuthor);
export default router;
