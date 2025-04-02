import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import { connectRedis } from "./lib/redis.js";
import authRoutes from "./routes/auth.route.js"
import problemsRoutes from "./routes/problems.route.js"
import submissionRoutes from "./routes/submission.route.js"
import { startJudgeWorker } from "./services/judge.service.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());


app.use("/api/auth", authRoutes);
app.use("/api/problems", problemsRoutes);
app.use("/api/submissions", submissionRoutes);


const startServer = async () => {
    await connectDB();
    await connectRedis();
    startJudgeWorker();
    app.listen(PORT, () => {
        console.log("Server is running on port", PORT);
    });
}

startServer();
