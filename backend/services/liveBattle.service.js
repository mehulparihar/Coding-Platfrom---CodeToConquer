// backend/services/liveBattle.js
import { Server } from 'socket.io';
import Submission from '../models/submission.model.js';
import { runCodeInContainer } from './judge.service.js';

let ioInstance = null;

const initLiveBattle = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const activeBattles = new Map();

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a battle room
    socket.on('joinBattle', async ({ battleId, userId }) => {
      socket.join(battleId);
      console.log(`User ${userId} joined battle ${battleId}`);

      // Initialize battle state
      if (!activeBattles.has(battleId)) {
        activeBattles.set(battleId, {
          participants: new Set(),
          problem: null,
          startTime: Date.now(),
          submissions: new Map()
        });
      }
      
      const battle = activeBattles.get(battleId);
      battle.participants.add(userId);

      // Send initial battle state
      io.to(battleId).emit('battleUpdate', {
        participants: Array.from(battle.participants),
        problem: battle.problem,
        timeElapsed: Date.now() - battle.startTime
      });
    });

    // Handle real-time code updates
    socket.on('codeUpdate', ({ battleId, userId, code }) => {
      socket.to(battleId).emit('codeUpdate', {
        userId,
        code: code.slice(0, 5000) // Limit code size for security
      });
    });

    // Handle real-time submissions
    socket.on('submitCode', async ({ battleId, userId, code, language }) => {
      try {
        const battle = activeBattles.get(battleId);
        if (!battle) return;

        // Create temporary submission
        const submission = {
          code,
          language,
          problem: battle.problem,
          submittedAt: Date.now()
        };

        // Run against all test cases
        const results = await Promise.all(
          battle.problem.testCases.map(testCase => 
            runCodeInContainer(submission, testCase)
          )
        );

        const passed = results.every(r => r.passed);
        
        // Store submission results
        battle.submissions.set(userId, {
          code,
          passed,
          executionTime: results.reduce((sum, r) => sum + r.executionTime, 0),
          timestamp: Date.now()
        });

        // Broadcast results
        io.to(battleId).emit('submissionResult', {
          userId,
          passed,
          executionTime: results[0].executionTime,
          totalTestCases: battle.problem.testCases.length,
          passedTestCases: results.filter(r => r.passed).length
        });

        // Check battle completion
        if (Array.from(battle.submissions.values()).every(s => s.passed)) {
          endBattle(battleId);
        }

      } catch (error) {
        console.error('Live battle submission error:', error);
        socket.emit('submissionError', {
          message: 'Failed to process submission',
          error: error.message
        });
      }
    });

    // Handle battle termination
    socket.on('leaveBattle', (battleId) => {
      socket.leave(battleId);
      console.log(`User left battle ${battleId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  const endBattle = (battleId) => {
    const battle = activeBattles.get(battleId);
    if (!battle) return;

    // Calculate final scores
    const results = Array.from(battle.submissions.entries())
      .map(([userId, submission]) => ({
        userId,
        ...submission
      }))
      .sort((a, b) => a.executionTime - b.executionTime);

    // Save to database
    results.forEach(async (result, index) => {
      const submission = new Submission({
        user: result.userId,
        problem: battle.problem._id,
        code: result.code,
        language: result.language,
        result: result.passed ? 'Accepted' : 'Wrong Answer',
        executionTime: result.executionTime,
        battleRank: index + 1
      });
      await submission.save();
    });

    // Broadcast final results
    io.to(battleId).emit('battleEnd', {
      rankings: results.map(r => ({
        userId: r.userId,
        executionTime: r.executionTime,
        passed: r.passed
      }))
    });

    activeBattles.delete(battleId);
  };

  ioInstance = io;
  return io;
};

// Helper to set battle problem
const setBattleProblem = (battleId, problem) => {
  if (activeBattles.has(battleId)) {
    activeBattles.get(battleId).problem = problem;
    ioInstance.to(battleId).emit('problemUpdate', problem);
  }
};

export { initLiveBattle, setBattleProblem };