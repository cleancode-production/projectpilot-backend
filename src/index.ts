import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route";
import prisma from "./lib/prisma";
import userRoutes from "./routes/user.route";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (_, res) => {
  res.send("Hello from project-pilot backend!");
});

app.use("/api/auth", authRoutes);
app.use("/", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
