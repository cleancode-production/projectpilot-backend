import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

dotenv.config();
const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

app.get("/", (_, res) => {
  res.send("Hello from project-pilot backend!");
});

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
