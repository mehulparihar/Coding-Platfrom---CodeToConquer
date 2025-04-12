import { Server } from "socket.io";
import Submission from "../models/submission.model.js";
import Problems from "../models/problem.model.js";
import { connectQueue } from "../lib/rabbitmq.js";
import Battle from "../models/battle.model.js";
import User from "../models/user.model.js";
// import { submitBattleCode } from "../controllers/battle.controller.js"; // if needed

const channelPromise = connectQueue();

const socketHandler = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Optional authentication middleware (if needed)
  // io.use(async (socket, next) => {
  //   try {
  //     const token = socket.handshake.auth.token;
  //     const user = await verifyToken(token); // Implement your token verification
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
        console.log(`✅ ${userId} joined battle: ${battleId}`);

        io.to(battleId).emit("userJoined", { userId, message: "A new user has joined!" });

        // Send updated battle details (populate if needed)
        const updatedBattle = await Battle.findById(battleId)
          .populate("participants.user")
          .populate("problem");
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

        // Determine if battle is complete based on at least one successful submission.
        // Note: Adjust logic as needed (e.g. if you wait for one success or collect multiple submissions).
        const solvedParticipants = battle.participants.filter((p) => p.solved);
        if (solvedParticipants.length > 0) {
          battle.status = "completed";
          // Sort only those who solved by completionTime (fastest wins)
          solvedParticipants.sort((a, b) => a.completionTime - b.completionTime);
          battle.winner = solvedParticipants[0].user;
          await battle.save();

          // Re-fetch updated battle with populated winner
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

        // If your Battle schema includes a messages array, push and save:
        if (!battle.messages) battle.messages = [];
        battle.messages.push(newMessage);
        await battle.save();

        // For emitting, we can try to use socket.user if available; otherwise, use a default.
        
        const senderName = socket.user && socket.user.username ? socket.user.username : `User-${userId}`;
        const name = await User.findById(userId);
        io.to(battleId).emit("newMessage", {
          user: { _id: userId, username: name.username },
          text: message,
          timestamp: newMessage.timestamp
        });
      } catch (error) {
        socket.emit("errorMessage", error.message);
      }
    });

    // 5. Start Battle
    socket.on("startBattle", async ({ battleId }) => {
      try {
        const battle = await Battle.findById(battleId);
        if (!battle) {
          return socket.emit("errorMessage", "Battle not found");
        }
        battle.status = "active";
        battle.startTime = new Date();
        // Set endTime based on duration (assume duration is in minutes)
        if (battle.duration) {
          battle.endTime = new Date(Date.now() + battle.duration * 60000);
        }
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
          if (!battle || !battle.endTime) return;
          const now = new Date();
          const timeLeft = Math.max(0, battle.endTime - now);
          
          io.to(battleId).emit("timeUpdate", { timeLeft, status: battle.status });
          
          if (timeLeft <= 0) {
            battle.status = 'completed';
            await battle.save();
            // Re-fetch updated battle with winner populated if available
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
