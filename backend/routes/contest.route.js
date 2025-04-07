import express from "express";
import { getLeaderboard, submitSolution,joinContest, getAllUpcommingContest, createContest} from "../controllers/contest.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post('/', protectRoute, adminRoute, createContest);
router.get('/upcoming', getAllUpcommingContest);
router.post('/:id/join', protectRoute, joinContest);
router.post('/submit', protectRoute, submitSolution);
router.get('/:id/leaderboard', getLeaderboard);

export default router;

