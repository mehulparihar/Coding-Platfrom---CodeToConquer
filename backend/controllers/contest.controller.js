import Contest from "../models/contest.model.js";
import Problems from "../models/problem.model.js";

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
        const contests = await Contest.find({
            startTime: { $gt: new Date() },
            isPublished: true
        }).populate('problems', 'title difficulty') // Populate problem details
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

    } catch (error) {

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
