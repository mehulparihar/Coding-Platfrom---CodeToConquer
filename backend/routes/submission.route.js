import express from "express";
import { allSubmission, getSubmissionById, submitCode } from "../controllers/submisson.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", submitCode);
router.get("/", allSubmission);
router.get("/user/:submissionId", protectRoute, getSubmissionById);

export default router;