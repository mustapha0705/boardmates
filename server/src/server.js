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
// Off by default — global limits are easy to trip during dev (Strict Mode, Supabase refresh, HMR).
// Turn on in production: RATE_LIMIT_ENABLED=true
const enableRateLimit =
  process.env.RATE_LIMIT_ENABLED === "true" || process.env.RATE_LIMIT_ENABLED === "1";

if (enableRateLimit) {
  const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX);
  const limit = Number.isFinite(RATE_LIMIT_MAX) && RATE_LIMIT_MAX > 0 ? RATE_LIMIT_MAX : 2000;
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit,
      message: "Too many requests, please try again later.",
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
}

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
