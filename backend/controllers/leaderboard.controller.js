import User from "../models/user.model.js";

export const getLeaderboard = async (req, res) => {
    try {
        const daily = await User.find().sort({ dailyScore: -1 }).limit(20);
        const weekly = await User.find().sort({ weeklyScore: -1 }).limit(20);
        const allTime = await User.find().sort({ score: -1 }).limit(20);
        const streaks = await User.find().sort({ currentStreak: -1 }).limit(20);
        const battleWins = await User.find().sort({ battleWon: -1 }).limit(20);
        const contests = await User.find().sort({ battleWon: -1 }).limit(20);
        res.json({ daily, weekly, allTime, contests, streaks });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};