import express from "express";
import { configDotenv } from "dotenv";
configDotenv()

const app = express();
const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.json({ msg: "Boardmates API works..." });
});

app.listen(PORT, () => {
  console.log(`server running at address http://localhost:${PORT}`);
});
