import Battle from "../models/battle.model.js";
import Problems from "../models/problem.model.js";
import User from "../models/user.model.js";

export const createBattle = async (req, res) => {
    try {
        const { problemId, userId, title } = req.body;
        const problem = await Problems.findById(problemId);
        if (!problem) return res.status(404).json({ message: "Problem not found" });

        const battle = new Battle({
            title,
            problem: problemId,
            participants: [{ user: userId, code: "", language: "", solved: false, completionTime: null }],
            startTime: new Date(),
            status: "waiting",
        });

        await battle.save();
        res.status(201).json(battle);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const joinBattle = async (req, res) => {
    try {
        const { userId } = req.body;
        const battle = await Battle.findById(req.params.battleId);
        if (!battle) return res.status(404).json({ message: "Battle not found" });
    
        battle.participants.push(userId);
        if (battle.participants.length === 2) battle.status = "active";
    
        await battle.save();
        res.json(battle);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
}

export const getAllBattles = async (req, res) => {
    try {
        const battles = await Battle.find().populate("problem participants");
        res.json(battles);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
}