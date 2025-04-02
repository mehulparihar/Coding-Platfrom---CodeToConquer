import express from "express";
import { getAllProblem, getProblemById,insertProblem } from "../controllers/problem.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:id", getProblemById);
router.get("/", getAllProblem);
router.post("/", protectRoute, adminRoute , insertProblem);

export default router;
