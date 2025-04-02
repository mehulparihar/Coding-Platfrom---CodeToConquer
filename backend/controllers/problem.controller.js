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
        res.status(500).json({message : "error while inserting" ,error: err.message });
    }
}