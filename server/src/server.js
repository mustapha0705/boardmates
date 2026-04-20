import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import { connectDB, disconnectDB } from "../config/db.js";
import { configDotenv } from "dotenv";
configDotenv()

connectDB();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later."
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);

app.get('/health', (req, res) => {
  res.json({
      status: 'OK',
      message: 'Boardmates API is running',
      timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({ msg: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`server running at address http://localhost:${PORT}`);
});

process.on('unHandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received, shutting down gracefully...');
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});
