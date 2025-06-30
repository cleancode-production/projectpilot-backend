import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import projectRoutes from "./routes/project.route";
import taskRoutes from "./routes/task.route";
import workspaceRoutes from "./routes/workspace.route";
import usersRoutes from "./routes/users.route";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (_, res) => {
  res.send("Hello from project-pilot backend!");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", usersRoutes); // Ensure this is the last route to avoid conflicts

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
