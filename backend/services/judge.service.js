import Docker from "dockerode";
import { client } from "../lib/redis.js";
import Submission from "../models/submission.model.js";
import Problems from "../models/problem.model.js";
import User from "../models/user.model.js";
import { PassThrough } from "stream";
import amqplib from "amqplib";

const docker = new Docker();
const RABBITMQ_URL = "amqp://localhost";
const TIMEOUT = 5000; // 5 seconds

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

const runCodeInContainer = async (submission, testCase) => {
  let container;
  try {
    // 1. Create container with proper I/O config
    container = await docker.createContainer({
      Image: getImage(submission.language),
      Cmd: ["sh", "-c", "sleep 2"],
      HostConfig: {
        AutoRemove: true,
        Memory: 536870912,
        NetworkMode: "none",
      },
      WorkingDir: "/app", // Set working directory
      OpenStdin: true,
      Tty: false,
    });

    await container.start();
    console.log("Container started");

    // 2. Build the code inside the container.
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
    // console.log("Build Output:\n", buildOutput);
    // console.log("Build completed!");

    // 3. Run the compiled code with the test case input.
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
    console.log("Runtime Output:\n", output);
    return {
      output,
      status: output ? "Completed" : "Runtime Error",
    };
  } finally {
    if (container) {
      await container.stop().catch(() => {});
      await container.remove().catch(() => {});
    }
  }
};

const processSubmission = async (submissionId) => {
  try {
    const submission = await Submission.findById(submissionId)
      .populate("problem")
      .populate("user");

    const results = [];

    // Process each test case separately
    for (const testCase of submission.problem.testCases) {
      const result = await runCodeInContainer(submission, testCase);
      const passed = result.output === testCase.expected_output.trim();
      console.log("Test Passed:", passed);
      results.push({
        input: testCase.input,
        expected: testCase.expected_output,
        actual: result.output,
        passed,
      });
    }

    const allPassed = results.every((r) => r.passed);
    console.log("All Passed:", allPassed);
    await Submission.findByIdAndUpdate(submissionId, {
      status: allPassed ? "Accepted" : "Wrong Answer",
      results : results,
    });

    if (allPassed) {
      await User.findByIdAndUpdate(submission.user._id, {
        $inc: { score: calculateScore(submission) },
        $addToSet: { submissions : submission.problem.id }
      });
      await Problems.findByIdAndUpdate(
        submission.problem._id,
        {
            $inc: { solveCount: 1 }
        },
    );
    }
  } catch (error) {
    console.error(`Error processing ${submissionId}:`, error);
    await Submission.findByIdAndUpdate(submissionId, {
      result: "Runtime Error",
      error: error.message,
    });
  }
};

// Start worker
const startJudgeWorker = async () => {
  while (true) {
    const connection = await amqplib.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue("submissions");
    channel.consume("submissions", async (msg) => {
      const { submissionId } = JSON.parse(msg.content.toString());
      console.log("Processing submission:", submissionId);
      await processSubmission(submissionId);
      channel.ack(msg);
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
};

export { startJudgeWorker,runCodeInContainer };
