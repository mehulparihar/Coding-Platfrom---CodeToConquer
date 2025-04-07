import express from "express";
import { getAllProblem, getProblemById,insertProblem,deleteProblem,getdailyChallenge } from "../controllers/problem.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:id", getProblemById);
router.get("/", getAllProblem);
router.post("/", protectRoute, adminRoute , insertProblem);
router.delete("/:id", protectRoute, adminRoute, deleteProblem);
router.post("/daily", getdailyChallenge);
export default router;
