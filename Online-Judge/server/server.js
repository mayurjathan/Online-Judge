const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
const authRoutes = require("./routes/auth");
const protectedRoutes = require("./middleware/protected");
const problemRoutes = require("./routes/problem");

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/problems", problemRoutes);

// MongoDB connect
const PORT = process.env.PORT || 5050;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected:", mongoose.connection.name);

    // Serve static frontend
    app.use(express.static(path.join(__dirname, "../client/dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../client/dist/index.html"));
    });

    app.listen(PORT, () => {
      console.log(` Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(" MongoDB connection error:", err);
  }
}

startServer();
