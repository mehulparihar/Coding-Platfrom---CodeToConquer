import DailyChallenge from "../models/DailyChallenge.model.js";
import Problems from "../models/problem.model.js";

export const getProblemById = async (req, res) => {
    try {
        const problemId = req.params.id;
        const problem = await Problems.findById(problemId);
        if(!problem) return res.status(404).json({ error: "Problem not found" });
        res.json(problem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getdailyChallenge = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const challenge = await DailyChallenge.findOne({ date: today })
        .populate('problem');
        const response = {
            ...challenge.toObject(),
            date: challenge.date.toISOString()
          };
        res.json(challenge);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const getAllProblem = async (req, res) => {
    try {
        const problems = await Problems.find();
        res.json(problems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const insertProblem = async (req, res) => {
    try {
        const problem = new Problems(req.body);
        await problem.save();
        res.json(problem);
    } catch (error) {
        res.status(500).json({message : "error while inserting" ,error: error.message });
    }
}

export const deleteProblem = async (req, res) => {
    try {
        const problem = await Problems.findById(req.params.id);
        if(!problem){
            return res.status(404).json({ message: "Problem not found" });
        }
        await Problems.findByIdAndDelete(req.params.id);
        res.json({message : "Problem deleted successfully"});   
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}