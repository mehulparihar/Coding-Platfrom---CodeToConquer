import Contest from "../models/contest.model.js";
import Problems from "../models/problem.model.js";
import Submission from "../models/submission.model.js";
import { connectQueue } from "../lib/rabbitmq.js";
const channelPromise = connectQueue();

export const createContest = async (req, res) => {
    try {
        const problems = await Problems.find({
            _id: { $in: req.body.problems }
        });

        if (problems.length !== req.body.problems.length) {
            return res.status(400).send('One or more problems not found');
        }

        const contest = new Contest(req.body);

        await contest.save();
        res.status(201).send(contest);
    } catch (error) {
        res.status(400).send(error.message);
    }
}


export const getAllUpcommingContest = async (req, res) => {
    try {
        const contests = await Contest.find().populate('problems', 'title difficulty') 
            .sort('startTime')
            .lean();

        const response = contests.map(contest => ({
            _id: contest._id,
            title: contest.title,
            startTime: contest.startTime,
            endTime: contest.endTime,
            problemCount: contest.problems.length,
            participants: contest.participants,
            problems: contest.problems.map(p => ({
                _id: p._id,
                title: p.title,
                difficulty: p.difficulty
            }))
        }));

        res.send(response);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export const joinContest = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest) return res.status(404).send('Contest not found');

        const isParticipant = contest.participants.some(p =>
            p.user.toString() === req.user._id.toString()
        );

        if (!isParticipant) {
            contest.participants.push({ user: req.user._id });
            await contest.save();
        }


        res.send(contest);
    } catch (error) {
        res.status(500).send(err.message);
    }
}

export const submitSolution = async (req, res) => {
    const { user_id, problem_id, code, language } = req.body;
    try {
        const contest = await Contest.findById(req.params.contestId)
        .populate('problems')
        .populate('participants.user');
        
        if (!contest) return res.status(404).json({ error: "Contest not found" });
        
        const now = new Date();
        if (now < contest.startTime || now > contest.endTime) {
                return res.status(400).json({ error: "Contest is not active" });
            }
            
            // 2. Validate problem belongs to contest
            const problem = contest.problems.find(p => p._id.toString() === problem_id.toString());
            if (!problem) return res.status(400).json({ error: "Problem not in contest" });
            
            // // 3. Validate user participation
            const participant = contest.participants.find(p => p.user._id.toString() === user_id);
            if (!participant) return res.status(403).json({ error: "User not registered for contest" });
            
            const submission = await Submission.create({
                user: user_id,
                problem: problem_id,
                contest : req.params.contestId,
                code,
                language,
            });
            
            await Problems.findByIdAndUpdate(problem_id, { $inc: { attemptCount: 1 } });
            
            participant.submissions.push({
                    submission: submission._id,
                    timestamp: new Date()
                });
                console.log("test");

        const channel = await channelPromise;
        channel.sendToQueue("submissions", 
            Buffer.from(JSON.stringify({
                submissionId: submission._id,
                // testCases: problem.testCases,
            }))
        );
        res.status(202).json(submission);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const getContestById = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id).populate('problems').populate('participants.user');
        res.send(contest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const getLeaderboard = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id)
            .populate('participants.user', 'username')
            .sort('participants.score');

        const leaderboard = contest.participants.map(p => ({
            username: p.user.username,
            score: p.score,
            lastSubmission: p.submissions[p.submissions.length - 1]?.timestamp
        }));

        res.send(leaderboard);
    } catch (error) {
        res.status(500).send(err.message);
    }
}
