const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());

// CORS setup
app.use(
  cors({
    origin: "http://localhost:5174",
    credentials: true,
  })
);

// MongoDB connect
const PORT = process.env.PORT || 5050;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    console.log("Connected to DB:", mongoose.connection.name);

    // Routes
    const authRoutes = require("./routes/auth");
    const protectedRoutes = require("./middleware/protected");
    const problemRoutes = require("./routes/problem");

    app.use("/api/auth", authRoutes);
    app.use("/api", protectedRoutes);
    app.use("/api/problems", problemRoutes);

    // Serve frontend
    app.use(express.static(path.join(__dirname, "../client/dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../client/dist/index.html"));
    });

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

startServer();
