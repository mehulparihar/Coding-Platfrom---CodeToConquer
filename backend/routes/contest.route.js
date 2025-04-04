import express from "express";
import { startContest } from "../controllers/contest.controller.js";

const router = express.Router();

router.post("/start", startContest);

export default router;

