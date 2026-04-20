import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import { connectDB, disconnectDB } from "../config/db.js";

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: "Too many requests, please try again later.",
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/profile", profileRoutes);

app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Boardmates API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

async function start() {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`server running at address http://localhost:${PORT}`);
  });

  process.on("unhandledRejection", (err) => {
    console.error("Unhandled rejection:", err);
    server.close(async () => {
      await disconnectDB();
      process.exit(1);
    });
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM signal received, shutting down gracefully...");
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  });
}

start();
