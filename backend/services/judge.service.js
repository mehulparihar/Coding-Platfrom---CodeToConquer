import Docker from "dockerode";
import { client } from "../lib/redis.js";
import Submission from "../models/submission.model.js";
import Problems from "../models/problem.model.js";
import User from "../models/user.model.js";
import { PassThrough } from "stream";

const docker = new Docker();
const TIMEOUT = 5000; // 5 seconds

const getImage = (language) => {
  const images = {
    python: 'python:3.9',
    cpp: 'gcc:latest',
    java: 'openjdk:11-jdk-slim'
  };
  return images[language.toLowerCase()] || 'python:3.9-slim';
};

const escapeShellArg = (str) => `'${str.replace(/'/g, "'\\''")}'`;

const getRuntimeCommand = (submission) => {
  const commands = {
    python: `python3 -c ${escapeShellArg(submission.code)}`,
    cpp: `sh -c "[ -x build/main ] && ./build/main || echo 'Error: Compiled file missing'"`,
    java: `java -cp build Main`
  };
  return commands[submission.language];
};
const buildCommand = (submission) => {
  return {
    python: ['sh', '-c', `mkdir -p build && echo ${escapeShellArg(submission.code)} > build/code.py`],
    cpp: ['sh', '-c', `mkdir -p build && echo ${escapeShellArg(submission.code)} > build/main.cpp && g++ build/main.cpp -o build/main || echo "Compilation Failed`],
    java: ['sh', '-c', `mkdir -p build && echo ${escapeShellArg(submission.code)} > build/Main.java && javac build/Main.java`]
  }[submission.language];
};
const calculateScore = (submission) => {
  const difficultyScores = {
    easy: 10,
    medium: 20,
    hard: 50
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
        NetworkMode: 'none',
      },
      OpenStdin: true,
      Tty: false 
    });

    await container.start();
    console.log("its working");

    const buildExec = await container.exec({
      Cmd: buildCommand(submission),
      AttachStdout: true,
      AttachStderr: true,
    });
    await buildExec.start();
    console.log("Build completed!");

    // 2. Create exec instance with proper I/O channels

    const exec = await container.exec({
      Cmd: ["sh", "-c", `echo ${escapeShellArg(testCase.input)} | timeout ${TIMEOUT / 1000} ${getRuntimeCommand(submission)}`],
      AttachStdout: true,
      AttachStderr: true,
   });


    // 3. Handle streams properly
    const output = await new Promise((resolve, reject) => {
      const outputStream = new PassThrough();
      let output = '';

      exec.start({ hijack: true }, (err, stream) => {
        if (err) return reject(err);

        // Pipe streams
        container.modem.demuxStream(stream, outputStream, outputStream);

        outputStream.on('data', chunk => {
          output += chunk.toString();
        });
        
        stream.on('end', () => resolve(output.trim()));
        stream.on('error', reject);
      });
    });
    console.log(output);
    return {
      output,
      status: output ? 'Completed' : 'Runtime Error'
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
      .populate('problem')
      .populate('user');

    const results = [];

    // Process each test case separately
    for (const testCase of submission.problem.testCases) {
      const result = await runCodeInContainer(submission, testCase);
      const passed = result.output === testCase.expected_output.trim();
      console.log(passed);
      results.push({
        input: testCase.input,
        expected: testCase.expected_output,
        actual: result.output,
        passed,
        executionTime: result.executionTime
      });
    }

    const allPassed = results.every(r => r.passed);
    console.log(allPassed, "yes passes");
    await Submission.findByIdAndUpdate(submissionId, {
      status: allPassed ? 'Accepted' : 'Wrong Answer',
      executionTime: results.executionTime
    });

    if (allPassed) {
      await User.findByIdAndUpdate(submission.user._id, {
        $inc: { score: calculateScore(submission) }

      });
      
    }

  } catch (error) {
    console.error(`Error processing ${submissionId}:`, error);
    await Submission.findByIdAndUpdate(submissionId, {
      result: 'Runtime Error',
      error: error.message
    });
  }
};


// Start worker
const startJudgeWorker = async () => {
  while (true) {
    const submissionId = await client.rPop('submissions');
    if (!submissionId) continue;
    console.log(submissionId);
    if (submissionId) await processSubmission(submissionId);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};

export { startJudgeWorker };