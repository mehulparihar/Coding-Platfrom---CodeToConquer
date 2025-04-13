import { Server } from "socket.io";
import Submission from "../models/submission.model.js";
import Problems from "../models/problem.model.js";
import { connectQueue } from "../lib/rabbitmq.js";
import Battle from "../models/battle.model.js";
import User from "../models/user.model.js";

const channelPromise = connectQueue();

const socketHandler = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Optional authentication middleware can be added here if needed.
  // io.use(async (socket, next) => {
  //   try {
  //     const token = socket.handshake.auth.token;
  //     const user = await verifyToken(token); // Implement verifyToken()
  //     socket.user = user;
  //     next();
  //   } catch (err) {
  //     next(new Error("Authentication error"));
  //   }
  // });

  io.on("connection", (socket) => {
    console.log("🔗 New user connected:", socket.id);

    // 1. Join Battle Room
    socket.on("joinBattle", async ({ battleId, userId }) => {
      try {
        const battle = await Battle.findById(battleId);
        if (!battle) {
          socket.emit("errorMessage", "Battle not found!");
          return;
        }
        socket.join(battleId);
        console.log(`✅ User ${userId} joined battle: ${battleId}`);

        io.to(battleId).emit("userJoined", { userId, message: "A new user has joined!" });

        // Send updated battle details (populate if needed)
        const updatedBattle = await Battle.findById(battleId)
          .populate("participants.user")
          .populate("problem")
          .populate("winner");
        io.to(battleId).emit("battleUpdated", updatedBattle);
      } catch (err) {
        socket.emit("errorMessage", err.message);
      }
    });
    
    // 2. Live Code Updates
    socket.on("updateCode", async ({ battleId, userId, code }) => {
      try {
        const battle = await Battle.findById(battleId);
        if (!battle) {
          socket.emit("errorMessage", "Battle not found!");
          return;
        }
        const participant = battle.participants.find(
          (p) => p.user.toString() === userId.toString()
        );
        if (participant) {
          participant.code = code;
          await battle.save();
          // Broadcast updated code to others in the battle (excluding sender)
          socket.to(battleId).emit("codeUpdated", { userId, code });
        }
      } catch (error) {
        socket.emit("errorMessage", error.message);
      }
    });

    // 3. Submit Solution
    socket.on("submitSolution", async ({ battleId, userId, code, language }) => {
      try {
        console.log("Submitting solution for battle:", battleId, "User:", userId);
        const battle = await Battle.findById(battleId)
          .populate("participants.user")
          .populate("problem");
        if (!battle) {
          socket.emit("errorMessage", "Battle not found");
          return;
        }
        if (battle.status !== "active") {
          socket.emit("errorMessage", "Battle is not active");
          return;
        }
        const participant = battle.participants.find(
          (p) => p.user._id.toString() === userId.toString()
        );
        if (!participant) {
          socket.emit("errorMessage", "User not found in this battle");
          return;
        }

        // Create Submission
        const submission = await Submission.create({
          user: userId,
          problem: battle.problem._id,
          battle: battleId,
          code,
          language,
        });

        participant.code = code;
        participant.language = language;
        participant.submissionStatus = "running";
        await battle.save();

        // Send Submission to Judge Queue (via RabbitMQ)
        const channel = await channelPromise;
        channel.sendToQueue(
          "submissions",
          Buffer.from(JSON.stringify({ submissionId: submission._id }))
        );
        io.to(battleId).emit("submissionStatus", {
          userId,
          message: "User submitted a solution!",
        });
        console.log("📩 Submission sent to judge queue.");

        // Determine if at least one participant has solved the problem
        const solvedParticipants = battle.participants.filter((p) => p.solved);
        if (solvedParticipants.length > 0) {
          battle.status = "completed";
          // Sort only those who solved by completionTime (fastest wins)
          solvedParticipants.sort((a, b) => a.completionTime - b.completionTime);
          battle.winner = solvedParticipants[0].user;
          await battle.save();

          const updatedBattle = await Battle.findById(battleId)
            .populate("participants.user")
            .populate("problem")
            .populate("winner");
          io.to(battleId).emit("battleCompleted", updatedBattle);
        }
      } catch (error) {
        console.error("🚨 Error submitting solution:", error);
        socket.emit("submissionError", error.message);
      }
    });

    // 4. Chat Messaging
    socket.on("chatMessage", async ({ battleId, userId, message }) => {
      try {
        const battle = await Battle.findById(battleId);
        if (!battle) {
          return socket.emit("errorMessage", "Battle not found");
        }
        const newMessage = {
          user: userId,
          text: message,
          timestamp: new Date()
        };

        if (!battle.messages) battle.messages = [];
        battle.messages.push(newMessage);
        await battle.save();

        const sender = await User.findById(userId);
        io.to(battleId).emit("newMessage", {
          user: { _id: userId, username: sender ? sender.username : `User-${userId}` },
          text: message,
          timestamp: newMessage.timestamp
        });
      } catch (error) {
        socket.emit("errorMessage", error.message);
      }
    });

    // 5. Start Battle (Only the battle owner can start the battle)
    socket.on("startBattle", async ({ battleId, userId }) => {
      try {
        const battle = await Battle.findById(battleId);
        if (!battle) {
          return socket.emit("errorMessage", "Battle not found");
        }
        // Check if the user is the battle owner.
        if (battle.battleOwner && battle.battleOwner.toString() !== userId.toString()) {
          return socket.emit("errorMessage", "Only the battle owner can start the battle");
        }
        
        battle.status = "active";
        const startTime = new Date();
        battle.startTime = startTime;
        // Convert duration to a number (in minutes). Fallback to default (30) if missing.
        let duration = Number(battle.duration);
        if (isNaN(duration) || duration <= 0) {
          duration = 30; // Default to 30 minutes if invalid.
        }
        battle.endTime = new Date(startTime.getTime() + duration * 60000);
        await battle.save();
        io.to(battleId).emit("battleStarted", { battleId });

        
      } catch (error) {
        socket.emit("errorMessage", error.message);
      }
    });

    // 6. Start Timer: Emit time updates periodically.
    socket.on("startTimer", async (battleId) => {
      try {
        const timerInterval = setInterval(async () => {
          const battle = await Battle.findById(battleId);
          if (!battle) return;
          // If endTime is not defined, compute using startTime and duration.
          let endTime;
          if (battle.endTime) {
            endTime = new Date(battle.endTime).getTime();
          } else if (battle.startTime && battle.duration) {
            const duration = Number(battle.duration) || 30;
            endTime = new Date(battle.startTime.getTime() + duration * 60000).getTime();
          } else {
            return;
          }
          const now = Date.now();
          const diff = Math.max(0, endTime - now);
          io.to(battleId).emit("timeUpdate", { timeLeft: diff, status: battle.status });
          if (diff <= 0) {
            battle.status = 'completed';
            await battle.save();
            const updatedBattle = await Battle.findById(battleId)
              .populate("participants.user")
              .populate("problem")
              .populate("winner");
            io.to(battleId).emit("battleCompleted", updatedBattle);
            clearInterval(timerInterval);
          }
        }, 1000);
      } catch (error) {
        socket.emit("errorMessage", error.message);
      }
    });

    // 7. Disconnect
    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });

  return io;
};

export default socketHandler;
