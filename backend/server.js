import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import { connectRedis } from "./lib/redis.js";
import authRoutes from "./routes/auth.route.js"
import problemsRoutes from "./routes/problems.route.js"
import submissionRoutes from "./routes/submission.route.js"
import http from 'http';
import contestRoutes from "./routes/contest.route.js"
import cron from "./utils/cron.utils.js"
import battleRoutes from "./routes/battle.route.js"
import leaderboardRoutes from "./routes/leaderboard.route.js"
import socketHandler from "./services/liveBattle.service.js";
import cors from "cors";
import path from "path";


dotenv.config();
const app = express();
const httpServer = http.createServer(app);
const __dirname = path.resolve();


const PORT = process.env.PORT || 5000;

app.use(cookieParser());
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/problems", problemsRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/contest", contestRoutes);
app.use("/api/battles", battleRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "/frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}

const startServer = async () => {
    await connectDB();
    await connectRedis();
    socketHandler(httpServer);
    httpServer.listen(PORT, '0.0.0.0', () => {
        console.log("Server is running on port", PORT);
    });
}

startServer();
