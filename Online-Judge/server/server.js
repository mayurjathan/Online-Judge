// server/index.js - Make sure these routes are properly added

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Import routes
const authRoutes = require("./routes/auth");
const problemRoutes = require("./routes/problem");
const submissionRoutes = require("./routes/submission");
const commentRoutes = require("./routes/comment");
const leaderboardRoutes = require("./routes/leaderboard");
const contestRoutes = require("./routes/contest");
const profileRoute = require('./routes/profile');


// Middleware and route imports
const verifyToken = require("./middleware/auth");
const User = require("./models/User");
const Submission = require("./models/Submission");

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/contests", contestRoutes);
app.use('/api/profile', profileRoute);


// Profile routes - ADD THESE DIRECTLY IN INDEX.JS
app.get("/api/profile", verifyToken, async (req, res) => {
  try {
    console.log("Profile request received for user ID:", req.user.id);
    
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      console.log("User not found in database");
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User found:", user.name, user.email);

    // Get additional stats
    const totalSubmissions = await Submission.countDocuments({ userId: user._id });
    const solvedProblems = await Submission.distinct('problemId', { 
      userId: user._id, 
      status: 'Accepted' 
    });

    // Calculate rank
    const betterUsers = await User.countDocuments({
      $or: [
        { totalScore: { $gt: user.totalScore || 0 } },
        { 
          totalScore: user.totalScore || 0,
          solvedProblems: { $gt: solvedProblems.length }
        }
      ]
    });

    const userProfile = {
      _id: user._id,
      username: user.name,
      name: user.name,
      email: user.email,
      avatar: user.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
      joinedDate: user.createdAt,
      solvedProblems: solvedProblems.length,
      totalSubmissions,
      totalScore: user.totalScore || 0,
      rank: betterUsers + 1,
      contestsParticipated: user.contestsParticipated?.length || 0
    };

    console.log("Sending profile response:", userProfile);
    res.json(userProfile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update user profile
app.put("/api/profile", verifyToken, async (req, res) => {
  try {
    const { username, email, avatar } = req.body;
    const userId = req.user.id;

    console.log("Profile update request:", { username, email, avatar });

    const updateData = {};
    if (username) updateData.name = username;
    if (email) updateData.email = email;
    if (avatar) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    console.log("Profile updated successfully");

    res.json({
      username: user.name,
      email: user.email,
      avatar: user.avatar
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error.code === 11000) {
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
});

// Get user stats
app.get("/api/user/stats", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get submission stats
    const submissions = await Submission.find({ userId });
    const acceptedSubmissions = submissions.filter(s => s.status === 'Accepted');
    const uniqueProblems = new Set(acceptedSubmissions.map(s => s.problemId.toString()));
    
    // Get problem difficulty counts
    const Problem = require("./models/Problem");
    const allProblems = await Problem.find({}).select('difficulty');
    
    const stats = {
      totalProblems: allProblems.length,
      solvedProblems: uniqueProblems.size,
      easyCount: allProblems.filter(p => p.difficulty === 'Easy').length,
      mediumCount: allProblems.filter(p => p.difficulty === 'Medium').length,
      hardCount: allProblems.filter(p => p.difficulty === 'Hard').length,
      totalSubmissions: submissions.length,
      acceptedSubmissions: acceptedSubmissions.length
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    service: "online-judge-server"
  });
});

// Test endpoints for debugging
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

app.get("/api/test-auth", verifyToken, (req, res) => {
  res.json({ 
    message: "Authentication is working!",
    user: req.user
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Serve frontend (React Vite or other static files)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected:", mongoose.connection.name);

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

startServer();