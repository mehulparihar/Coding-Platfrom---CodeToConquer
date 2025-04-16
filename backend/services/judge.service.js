import Docker from "dockerode";
import Submission from "../models/submission.model.js";
import Problems from "../models/problem.model.js";
import User from "../models/user.model.js";
import { PassThrough } from "stream";
import amqplib from "amqplib";
import DailyChallenge from "../models/DailyChallenge.model.js";
import Contest from "../models/contest.model.js";
import Battle from "../models/battle.model.js";

const docker = new Docker();
const RABBITMQ_URL = process.env.RABBITMQ_URL;
const TIMEOUT = 5000;


const getImage = (language) => {
  const images = {
    python: "python:3.9",
    cpp: "gcc:latest",
    java: "openjdk:11-jdk-slim",
  };
  return images[language.toLowerCase()] || "python:3.9-slim";
};

const escapeShellArg = (str) => `'${str.replace(/'/g, "'\\''")}'`;

const getRuntimeCommand = (submission) => {
  const commands = {
    python: `python3 build/code.py`,
    cpp: `./build/main`,
    java: `java -cp build Main`,
  };
  return commands[submission.language];
};

const buildCommand = (submission) => {
  return {
    python: [
      "sh",
      "-c",
      `mkdir -p build && echo ${escapeShellArg(submission.code)} > build/code.py`
    ],
    cpp: [
      "sh",
      "-c",
      `mkdir -p build && echo ${escapeShellArg(submission.code)} > build/main.cpp && ls -lah build && cat build/main.cpp && g++ build/main.cpp -o build/main 2> build/error.log && ls -lah build && chmod +x build/main || { cat build/error.log; echo "Compilation Failed"; exit 1; }`
    ],
    java: [
      "sh",
      "-c",
      `mkdir -p build && echo ${escapeShellArg(submission.code)} > build/Main.java && javac build/Main.java`
    ]
  }[submission.language];
};

const calculateScore = (submission) => {
  const difficultyScores = {
    easy: 10,
    medium: 20,
    hard: 50,
  };
  return difficultyScores[submission.problem.difficulty.toLowerCase()] || 10;
};

const updateBattleStatus = async (submission) => {
  const battle = await Battle.findById(submission.battle);
  if (!battle) {
    return;
  }
  if (battle.status === "completed") {
    return;
  }
  const userId = submission.user._id;
  const participantIndex = battle.participants.findIndex(
    (p) => p.user._id.toString() === userId.toString()
  );

  if (participantIndex === -1) {
    return;
  }

  const completionTime = new Date() - battle.startTime;
  battle.participants[participantIndex].solved = true;
  battle.participants[participantIndex].completionTime = completionTime;
  battle.participants[participantIndex].submissionStatus = "passed";


  const solvedParticipants = battle.participants.filter(p => p.solved);
  if (solvedParticipants.length > 0) {

    solvedParticipants.sort((a, b) => a.completionTime - b.completionTime);
    battle.status = "completed";
    battle.winner = solvedParticipants[0]._id;
    battle.score = 100;
  }

  await battle.save();
};

const updateContestLeaderboard = async (submission) => {
  const contestId = submission.contest._id;
  const userId = submission.user._id;
  const problemId = submission.problem._id;
  const score = calculateScore(submission);

  const contest = await Contest.findById(contestId);

  if (!contest) {
    return;
  }

  let participant = contest.participants.find((p) => p.user.toString() === userId.toString());

  if (!participant) {
    participant = {
      user: userId,
      submissions: [],
      score: 0,
    };
    contest.participants.push(participant);
  }

  const existingSubmission = participant.submissions.find((sub) => sub.problem.toString() === problemId.toString());

  if (!existingSubmission || !existingSubmission.passed) {
    participant.submissions.push({
      problem: problemId,
      code: submission.code,
      passed: true,
      timestamp: new Date(),
    });

    participant.score += score;
  }

  await contest.save();
};


const runCodeInContainer = async (submission, testCase) => {
  let container;
  try {

    container = await docker.createContainer({
      Image: getImage(submission.language),
      Cmd: ["sh", "-c", "sleep 2"],
      HostConfig: {
        AutoRemove: true,
        Memory: 536870912,
        NetworkMode: "none",
      },
      WorkingDir: "/app",
      OpenStdin: true,
      Tty: false,
    });

    await container.start();

    const buildExec = await container.exec({
      Cmd: buildCommand(submission),
      AttachStdout: true,
      AttachStderr: true,
    });

    const buildOutput = await new Promise((resolve, reject) => {
      const outputStream = new PassThrough();
      let output = "";
      buildExec.start({ hijack: true }, (err, stream) => {
        if (err) return reject(err);
        container.modem.demuxStream(stream, outputStream, outputStream);
        outputStream.on("data", (chunk) => {
          output += chunk.toString();
        });
        stream.on("end", () => resolve(output.trim()));
        stream.on("error", reject);
      });
    });

    const exec = await container.exec({
      Cmd: [
        "sh",
        "-c",
        `echo ${escapeShellArg(testCase.input)} | timeout ${TIMEOUT / 1000} ${getRuntimeCommand(submission)}`
      ],
      AttachStdout: true,
      AttachStderr: true,
    });

    const output = await new Promise((resolve, reject) => {
      const outputStream = new PassThrough();
      let output = "";
      exec.start({ hijack: true }, (err, stream) => {
        if (err) return reject(err);
        container.modem.demuxStream(stream, outputStream, outputStream);
        outputStream.on("data", (chunk) => {
          output += chunk.toString();
        });
        stream.on("end", () => resolve(output.trim()));
        stream.on("error", reject);
      });
    });
    return {
      output,
      status: output ? "Completed" : "Runtime Error",
    };
  } finally {
    if (container) {
      await container.stop().catch(() => { });
      await container.remove().catch(() => { });
    }
  }
};

const processSubmission = async (submissionId) => {
  try {
    const submission = await Submission.findById(submissionId)
    .populate("problem")
    .populate("user")
    .populate("contest")
    .populate("battle");
    
    const isContestSubmission = !!submission.contest;
    const isBattleSubmission = !!submission.battle;
    const results = [];
    
    for (const testCase of submission.problem.testCases) {
      const result = await runCodeInContainer(submission, testCase);
      const passed = result.output === testCase.expected_output.trim();
      results.push({
        input: testCase.input,
        expected: testCase.expected_output,
        actual: result.output,
        passed,
      });
    }
    
    const allPassed = results.every((r) => r.passed);

    await Submission.findByIdAndUpdate(submissionId, {
      status: allPassed ? "Accepted" : "Wrong Answer",
      results: results,
    });

    if (allPassed) {

      const currentDate = new Date().setHours(0, 0, 0, 0);
      const dailyChallenge = await DailyChallenge.findOne({ date: currentDate });
      if (isContestSubmission) {
        await updateContestLeaderboard(submission);
      }

      if (isBattleSubmission) {
        await updateBattleStatus(submission);
      }

      const progress = await User.findOne(submission.user._id);
      const isPreviousDayCompletion = progress?.lastCompleted
        ? progress.lastCompleted.getDate() === (new Date().getDate() - 1)
        : false;

      const newStreak = (progress?.currentStreak || 0) + 1;

      await User.updateOne(
        { _id: submission.user._id },
        {
          $set: {
            currentStreak: newStreak,
            lastCompleted: new Date(),
            isCompletedToday: true
          }
        },
        { upsert: true }
      );

      await User.findByIdAndUpdate(submission.user._id, {
        $inc: { score: calculateScore(submission) },
        $addToSet: { submissions: submission.problem.id }
      });
      await Problems.findByIdAndUpdate(
        submission.problem._id,
        {
          $inc: { solveCount: 1 }
        },
      );
    }
  } catch (error) {
    await Submission.findByIdAndUpdate(submissionId, {
      result: "Runtime Error",
      error: error.message,
    });
  }
};


const startJudgeWorker = async () => {
  while (true) {
    const connection = await amqplib.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue("submissions");
    channel.consume("submissions", async (msg) => {
      const { submissionId } = JSON.parse(msg.content.toString());
      await processSubmission(submissionId);
      channel.ack(msg);
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
};

export { startJudgeWorker, runCodeInContainer };
