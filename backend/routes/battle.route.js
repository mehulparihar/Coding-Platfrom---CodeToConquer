import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createBattle, getAllBattles, joinBattle,joinPrivateBattle,submitBattleCode,getBattleById } from "../controllers/battle.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createBattle);
router.post("/join/:battleId", protectRoute, joinBattle);
router.post("/join/private", protectRoute, joinPrivateBattle);
router.get("/", getAllBattles);
router.get("/:id", getBattleById);
router.post("/submit/:battleId", protectRoute, submitBattleCode);


export default router;