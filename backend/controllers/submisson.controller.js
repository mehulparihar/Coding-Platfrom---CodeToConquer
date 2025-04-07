import axios from "axios";
import Submission from "../models/submission.model.js";
import Problems from "../models/problem.model.js";
import { client } from "../lib/redis.js"
import { connectQueue } from "../lib/rabbitmq.js";

const channelPromise = connectQueue();
const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com/submissions";
const JUDGE0_API_KEY = "422d028478msh54f0f8734fdc900p1bfc78jsne9c10dabe328";

export const submitCode = async (req, res) => {
    const { user_id, problem_id, code, language, contest_id } = req.body;
    
    try {
        // 1. Validate contest exists and is active
        const contest = await Contest.findById(contest_id)
            .populate('problems')
            .populate('participants.user');
            
        if (!contest) return res.status(404).json({ error: "Contest not found" });
        
        const now = new Date();
        if (now < contest.startTime || now > contest.endTime) {
            return res.status(400).json({ error: "Contest is not active" });
        }

        // 2. Validate problem belongs to contest
        const problem = contest.problems.find(p => p._id.toString() === problem_id);
        if (!problem) return res.status(400).json({ error: "Problem not in contest" });

        // 3. Validate user participation
        const participant = contest.participants.find(p => p.user._id.toString() === user_id);
        if (!participant) return res.status(403).json({ error: "User not registered for contest" });

        // 4. Create submission
        const submission = await Submission.create({
            user: user_id,
            problem: problem_id,
            contest: contest_id,
            code,
            language,
        });

        // 5. Update problem attempts
        await Problems.findByIdAndUpdate(problem_id, { $inc: { attemptCount: 1 } });

        // 6. Update contest participant record
        participant.submissions.push({
            submission: submission._id,
            timestamp: new Date()
        });

        // 7. Add to processing queue
        const channel = await channelPromise;
        channel.sendToQueue("submissions", 
            Buffer.from(JSON.stringify({
                submissionId: submission._id,
                testCases: problem.testCases,
                contestId: contest_id
            }))
        );

        // 8. Update user streak (daily challenge logic)
        const user = await User.findById(user_id);
        const lastSubmission = user.lastSubmission || new Date(0);
        const hoursSinceLast = (new Date() - lastSubmission) / (1000 * 60 * 60);

        if (hoursSinceLast > 24) {
            user.streak = 1;
        } else {
            user.streak += 1;
        }
        user.lastSubmission = new Date();
        await user.save();

        res.status(202).json({
            ...submission.toObject(),
            streak: user.streak
        });

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


function getLanguageId(language) {
    const languages = {
        "Python": 71,
        "JavaScript": 63,
        "C++": 54,
        "Java": 62,
    };
    return languages[language] || 71; // Default to Python if not found
}