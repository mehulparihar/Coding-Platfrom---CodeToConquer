import axios from "axios";
import Submission from "../models/submission.model.js";
import Problems from "../models/problem.model.js";
import { client } from "../lib/redis.js"
import { connectQueue } from "../lib/rabbitmq.js";

const channelPromise = connectQueue();
const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com/submissions";
const JUDGE0_API_KEY = "422d028478msh54f0f8734fdc900p1bfc78jsne9c10dabe328";

export const submitCode = async (req, res) => {
    const { user_id, problem_id, code, language } = req.body;
    try {
        // Fetch problem test cases
        const problem = await Problems.findById(problem_id);
        if (!problem) return res.status(404).json({ error: "Problem not found" });

        // Submit each test case to Judge0
        // let allPassed = true;
        // let executionTime = 0;

        // for (const testCase of problem.test_cases) {
        //     const response = await axios.post(
        //         `${JUDGE0_API_URL}?base64_encoded=false&wait=true`,
        //         {
        //             source_code: code,
        //             language_id: getLanguageId(language),
        //             stdin: testCase.input,
        //             expected_output: testCase.expected_output,
        //         },
        //         {
        //             headers: {
        //                 "X-RapidAPI-Key": JUDGE0_API_KEY,
        //                 'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
        //             },
        //         }
        //     );

        //     const { status, time } = response.data;
        //     if (status.description !== "Accepted") {
        //         allPassed = false;
        //         break;
        //     }
        //     executionTime = Math.max(executionTime, time);
        // }

        // Save submission to DB
        const submission = await Submission.create({
            user : user_id,
            problem : problem_id,
            code,
            language,
        });

        // Add to Redis queue
        // await client.lPush('submissions', submission._id.toString());

        const channel = await channelPromise;
        channel.sendToQueue("submissions", Buffer.from(JSON.stringify({ submissionId: submission._id })));

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
        const submission = await Submission.find({ user_id: req.params.user_id }).populate("problem_id");
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