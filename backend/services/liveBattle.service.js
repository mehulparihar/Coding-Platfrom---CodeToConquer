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

  io.on("connection", (socket) => {

    socket.on("joinBattle", async ({ battleId, userId }) => {
      try {
        const battle = await Battle.findById(battleId);
        if (!battle) {
          socket.emit("errorMessage", "Battle not found!");
          return;
        }
        socket.join(battleId);

        io.to(battleId).emit("userJoined", { userId, message: "A new user has joined!" });

        const updatedBattle = await Battle.findById(battleId)
          .populate("participants.user")
          .populate("problem")
          .populate("winner");
        io.to(battleId).emit("battleUpdated", updatedBattle);
      } catch (err) {
        socket.emit("errorMessage", err.message);
      }
    });

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
          socket.to(battleId).emit("codeUpdated", { userId, code });
        }
      } catch (error) {
        socket.emit("errorMessage", error.message);
      }
    });


    socket.on("submitSolution", async ({ battleId, userId, code, language }) => {
      try {
    
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

        const channel = await channelPromise;
        channel.sendToQueue(
          "submissions",
          Buffer.from(JSON.stringify({ submissionId: submission._id }))
        );
        io.to(battleId).emit("submissionStatus", {
          userId,
          message: "User submitted a solution!",
        });

        const solvedParticipants = battle.participants.filter((p) => p.solved);
        if (solvedParticipants.length > 0) {
          battle.status = "completed";
          
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
        socket.emit("submissionError", error.message);
      }
    });

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


    socket.on("startBattle", async ({ battleId, userId }) => {
      try {
        const battle = await Battle.findById(battleId);
        if (!battle) {
          return socket.emit("errorMessage", "Battle not found");
        }
      
        if (battle.battleOwner && battle.battleOwner.toString() !== userId.toString()) {
          return socket.emit("errorMessage", "Only the battle owner can start the battle");
        }

        battle.status = "active";
        const startTime = new Date();
        battle.startTime = startTime;
        
        let duration = Number(battle.duration);
        if (isNaN(duration) || duration <= 0) {
          duration = 30; 
        }
        battle.endTime = new Date(startTime.getTime() + duration * 60000);
        await battle.save();
        io.to(battleId).emit("battleStarted", { battleId });


      } catch (error) {
        socket.emit("errorMessage", error.message);
      }
    });

   
    socket.on("startTimer", async (battleId) => {
      try {
        const timerInterval = setInterval(async () => {
          const battle = await Battle.findById(battleId);
          if (!battle) return;
          
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

    socket.on("disconnect", () => {
      
    });
  });

  return io;
};

export default socketHandler;
