import mongoose from "mongoose";

const DailyChallengeSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now, unique: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }
  });

const DailyChallenge = mongoose.model('DailyChallenge', DailyChallengeSchema);

export default DailyChallenge;