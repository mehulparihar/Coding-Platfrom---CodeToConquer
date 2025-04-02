import express from "express";
import { allSubmission, getSubmissionById, submitCode } from "../controllers/submisson.controller.js";

const router = express.Router();

router.post("/", submitCode);
router.get("/", allSubmission);
router.get("/user/:user_id", getSubmissionById);

export default router;