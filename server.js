import express from "express";
import chatRoutes from "./routes/chat.routes.js";
import { PORT } from "./config/env.js";

const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use("/api", chatRoutes);

// Health check
app.get("/", (req, res) => {
    res.send("AI Chatbot API is running...");
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});