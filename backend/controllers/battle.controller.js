import Battle from "../models/battle.model.js";
import Problems from "../models/problem.model.js";
import Submission from "../models/submission.model.js";
import { connectQueue } from "../lib/rabbitmq.js";
const channelPromise = connectQueue();

export const createBattle = async (req, res) => {
  try {
    const { title, mode, privacy, difficulty, maxParticipants, duration, code, creator } = req.body;
    const randomProblem = await Problems.aggregate([
      { $match: { difficulty } },
      { $sample: { size: 1 } }
    ]);
    
    if (!randomProblem.length) {
      return res.status(400).json({ success: false, message: `No ${difficulty} problems available` });
    }
    const problemId = randomProblem[0]._id;
    
    const battle = new Battle({
      title,
      battleType: mode,
      privacy,
      difficulty,
      maxParticipants,
      duration,
      problem: problemId,
      status: "waiting",
      battleCode: code,
      battleOwner: creator,

    });

    await battle.save();
    res.send(battle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBattleById = async (req, res) => {
  try {
    const battle = await Battle.findById(req.params.id).populate('participants.user')
      .populate('problem').populate('teamA').populate('teamB').populate('messages.user');
    res.send(battle);
  } catch (error) {
    res.status(500).json({ error: error.message });

  }
};
export const joinBattle = async (req, res) => {
  try {
    const { userId } = req.body;
    const { battleId } = req.params;

    const battle = await Battle.findById(battleId);
    if (battle.currentParticipants >= battle.maxParticipants) return;

    if (!battle.participants.some(p => p.user.equals(userId))) {
      battle.participants.push({
        user: userId,
        code: ''
      });
      battle.currentParticipants++;

      if (battle.currentParticipants === battle.maxParticipants) {
        battle.status = 'active';
        battle.startTime = new Date();
        battle.endTime = new Date(Date.now() + battle.duration * 60000);
      }

      await battle.save();
    }

    res.status(200).json({ success: true, battle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const joinPrivateBattle = async (req, res) => {
  try {
    const { battleCode, userId } = req.body;
    const battle = await Battle.findOne({ battleCode });
    if (!battle) return res.status(404).json({ success: false, message: "Invalid battle code" });

    if (battle.currentParticipants >= battle.maxParticipants) {
      return res.status(400).json({ success: false, message: "Battle is full" });
    }

    if (!battle.participants.some(p => p.user.equals(userId))) {
      battle.participants.push({
        user: userId,
        code: ''
      });
      battle.currentParticipants++;

      if (battle.currentParticipants === battle.maxParticipants) {
        battle.status = 'active';
        battle.startTime = new Date();
        battle.endTime = new Date(Date.now() + battle.duration * 60000);
      }

      await battle.save();
    }

    res.send(battle);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllBattles = async (req, res) => {
  try {
    const battles = await Battle.find().populate("participants");
    res.json(battles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const submitBattleCode = async (req, res) => {
  try {
    const { user_id, problem_id, code, language } = req.body;
    const battle = await Battle.findById(req.params.battleId)
      .populate('problem')
      .populate('participants.user');

    if (!battle) {
      return res.status(404).json({ error: "Battle not found" });
    }

    if (battle.status !== "active") {
      return res.status(400).json({ error: "Battle is not active" });
    }

    const participant = battle.participants.find(p => p._id.toString() === user_id);
    if (!participant) return res.status(403).json({ error: "User is not a participant in this battle" });

    const submission = await Submission.create({
      user: user_id,
      problem: problem_id,
      battle: req.params.battleId,
      code,
      language,
    });
    participant.code = code;
    participant.language = language;
    participant.submissionStatus = "running";
    await Problems.findByIdAndUpdate(problem_id, { $inc: { attemptCount: 1 } });


    const channel = await channelPromise;
    channel.sendToQueue("submissions",
      Buffer.from(JSON.stringify({
        submissionId: submission._id
      }))
    );

    res.status(202).json(submission);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}