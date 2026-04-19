import express from "express";
import { connectDB, disconnectDB } from "../config/db.js";
import { configDotenv } from "dotenv";
configDotenv()

connectDB();

const app = express();
const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.json({ msg: "Boardmates API works..." });
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
