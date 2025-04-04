import Problems from "../models/problem.model.js";
import { setBattleProblem } from "../services/liveBattle.service.js";


export const startContest = async (req, res) => {
    try {
        const problem = await Problems.findById(req.body.problemId);
        setBattleProblem(req.body.battleId, problem);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to start battle' });
    }
};