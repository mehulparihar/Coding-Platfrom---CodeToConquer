import Submission from "../models/submission.model.js";
import Problems from "../models/problem.model.js";
import { connectQueue } from "../lib/rabbitmq.js";

const channelPromise = connectQueue();

export const submitCode = async (req, res) => {
    const { user_id, problem_id, code, language } = req.body;

    try {
        const problem = await Problems.findById(problem_id);
        if (!problem) return res.status(404).json({ error: "Problem not found" });

        const submission = await Submission.create({
            user: user_id,
            problem: problem_id,
            code,
            language,
        });

        await Problems.findByIdAndUpdate(problem_id, { $inc: { attemptCount: 1 } });

        const channel = await channelPromise;
        channel.sendToQueue("submissions",
            Buffer.from(JSON.stringify({
                submissionId: submission._id,
                testCases: problem.testCases,
            }))
        );
            
        res.status(202).json(submission);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const allSubmission = async (req, res) => {
    try {
        const submissions = await Submission.find().populate("problem_id");
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getSubmissionById = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.submissionId);
        if (!submission) return res.status(404).json({ error: "Submission not found" });
        res.json(submission);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
