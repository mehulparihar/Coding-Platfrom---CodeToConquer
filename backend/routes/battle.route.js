import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createBattle, getAllBattles, joinBattle } from "../controllers/battle.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createBattle);
router.post("/join/:battleId", protectRoute, joinBattle);
router.get("/", getAllBattles);


export default router;