const express = require("express");
const router = express.Router();
const Submission = require("../models/Submission");
const Problem = require("../models/Problem");
const User = require("../models/User");
const verifyToken = require("../middleware/auth");

// Create a new submission (called from compiler service)
router.post("/", async (req, res) => {
  console.log("=== SUBMISSION SAVE REQUEST ===");
  console.log("Headers:", {
    authorization: req.headers.authorization ? "Present" : "Missing",
    contentType: req.headers['content-type'],
    userAgent: req.headers['user-agent']
  });
  console.log("Body:", req.body);

  try {
    const { 
      userId, 
      problemId, 
      code, 
      language, 
      status, 
      runtime, 
      testCasesPassed, 
      totalTestCases
    } = req.body;

    // Validate required fields
    if (!problemId) {
      console.log("❌ Missing problemId");
      return res.status(400).json({ error: "Missing problemId" });
    }
    if (!code) {
      console.log("❌ Missing code");
      return res.status(400).json({ error: "Missing code" });
    }
    if (!language) {
      console.log("❌ Missing language");
      return res.status(400).json({ error: "Missing language" });
    }
    if (!status) {
      console.log("❌ Missing status");
      return res.status(400).json({ error: "Missing status" });
    }

    console.log("✅ All required fields present");

    // Convert problemId to ObjectId if it's a string
    const mongoose = require('mongoose');
    const validProblemId = mongoose.Types.ObjectId.isValid(problemId) ? problemId : null;
    
    if (!validProblemId) {
      console.log("❌ Invalid problemId format:", problemId);
      return res.status(400).json({ error: "Invalid problemId format" });
    }

    // Verify problem exists
    const problem = await Problem.findById(validProblemId);
    if (!problem) {
      console.log("❌ Problem not found:", problemId);
      return res.status(404).json({ error: "Problem not found" });
    }
    console.log("✅ Problem found:", problem.title);

    // Verify user exists if userId provided
    let validUserId = null;
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.log("❌ Invalid userId format:", userId);
        return res.status(400).json({ error: "Invalid userId format" });
      }
      
      const user = await User.findById(userId);
      if (!user) {
        console.log("❌ User not found:", userId);
        return res.status(404).json({ error: "User not found" });
      }
      console.log("✅ User found:", user.name);
      validUserId = userId;
    }

    // Create submission
    const submissionData = {
      userId: validUserId,
      problemId: validProblemId,
      code,
      language,
      status,
      runtime: runtime || "0ms",
      testCasesPassed: testCasesPassed || 0,
      totalTestCases: totalTestCases || 0
    };

    console.log("Creating submission with data:", {
      ...submissionData,
      code: `[${submissionData.code.length} characters]` // Don't log full code
    });

    const submission = new Submission(submissionData);
    const savedSubmission = await submission.save();
    
    console.log("✅ Submission saved successfully:", {
      id: savedSubmission._id,
      status: savedSubmission.status,
      createdAt: savedSubmission.createdAt,
      userId: savedSubmission.userId,
      problemId: savedSubmission.problemId
    });

    // Update user stats if needed
    if (status === "Accepted" && validUserId) {
      try {
        console.log("Updating user stats for accepted submission...");
        const user = await User.findById(validUserId);
        if (user) {
          // Check if this is first accepted submission for this problem
          const existingAccepted = await Submission.findOne({
            userId: validUserId,
            problemId: validProblemId,
            status: "Accepted",
            _id: { $ne: savedSubmission._id }
          });

          if (!existingAccepted) {
            console.log("First time solving this problem - updating user stats");
            // First time solving this problem
            if (!user.solvedProblems) user.solvedProblems = [];
            if (!user.solvedProblems.includes(validProblemId)) {
              user.solvedProblems.push(validProblemId);
            }
            
            // Update score
            let scoreIncrement = 10;
            switch (problem.difficulty) {
              case "Easy": scoreIncrement = 10; break;
              case "Medium": scoreIncrement = 20; break;
              case "Hard": scoreIncrement = 30; break;
            }
            
            user.totalScore = (user.totalScore || 0) + scoreIncrement;
            console.log("✅ Added score:", scoreIncrement);
          } else {
            console.log("Problem already solved by user, no score update");
          }
          
          // Update total submissions count
          user.totalSubmissions = (user.totalSubmissions || 0) + 1;
          user.lastSubmission = new Date();
          await user.save();
          console.log("✅ User stats updated");
        }
      } catch (userUpdateError) {
        console.error("❌ Failed to update user stats:", userUpdateError);
      }
    }

    res.status(201).json({ 
      message: "Submission saved successfully",
      submissionId: savedSubmission._id,
      status: savedSubmission.status,
      timestamp: savedSubmission.createdAt
    });

  } catch (error) {
    console.error("❌ Error saving submission:", error);
    console.error("Stack:", error.stack);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ 
        error: "Validation failed",
        details: validationErrors
      });
    }
    
    res.status(500).json({ 
      error: "Failed to save submission",
      details: error.message
    });
  }
});

// Test endpoint to verify submissions route is working
router.get("/test", (req, res) => {
  res.json({ 
    message: "Submissions route is working!",
    timestamp: new Date().toISOString()
  });
});

// Get submissions for a specific problem by a user
router.get("/problem/:problemId", verifyToken, async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user.id;

    console.log("Fetching submissions for:", { userId, problemId });

    // Validate ObjectIds
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({ error: "Invalid problemId format" });
    }

    const submissions = await Submission.find({
      userId,
      problemId
    })
    .populate('problemId', 'title')
    .sort({ createdAt: -1 })
    .limit(50);

    console.log("Found submissions:", submissions.length);
    
    // Format submissions for frontend
    const formattedSubmissions = submissions.map(sub => ({
      _id: sub._id,
      problemTitle: sub.problemId?.title || 'Unknown Problem',
      status: sub.status,
      language: sub.language,
      runtime: sub.runtime,
      createdAt: sub.createdAt,
      testCasesPassed: sub.testCasesPassed,
      totalTestCases: sub.totalTestCases
    }));

    res.json(formattedSubmissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// Get recent submissions for a user
router.get("/recent", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Fetching recent submissions for user:", userId);

    const submissions = await Submission.find({ userId })
      .populate('problemId', 'title difficulty')
      .sort({ createdAt: -1 })
      .limit(20);

    console.log("Found recent submissions:", submissions.length);

    const formattedSubmissions = submissions.map(sub => ({
      _id: sub._id,
      problemTitle: sub.problemId?.title || 'Unknown Problem',
      problemDifficulty: sub.problemId?.difficulty || 'Unknown',
      status: sub.status,
      language: sub.language,
      runtime: sub.runtime,
      createdAt: sub.createdAt,
      testCasesPassed: sub.testCasesPassed,
      totalTestCases: sub.totalTestCases
    }));

    res.json(formattedSubmissions);
  } catch (error) {
    console.error("Error fetching recent submissions:", error);
    res.status(500).json({ error: "Failed to fetch recent submissions" });
  }
});

// Get all submissions for a user (for admin/profile)
router.get("/user/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if requesting user is the same as the target user (or admin)
    if (req.user.id !== userId) {
      // Add admin check here if needed
      // For now, allow any authenticated user to view
    }

    const submissions = await Submission.find({ userId })
      .populate('problemId', 'title difficulty')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Submission.countDocuments({ userId });

    const formattedSubmissions = submissions.map(sub => ({
      _id: sub._id,
      problemTitle: sub.problemId?.title || 'Unknown Problem',
      problemDifficulty: sub.problemId?.difficulty || 'Unknown',
      status: sub.status,
      language: sub.language,
      runtime: sub.runtime,
      createdAt: sub.createdAt,
      testCasesPassed: sub.testCasesPassed,
      totalTestCases: sub.totalTestCases
    }));

    res.json({
      submissions: formattedSubmissions,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error("Error fetching user submissions:", error);
    res.status(500).json({ error: "Failed to fetch user submissions" });
  }
});

// Get submission statistics
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Submission.aggregate([
      { $match: { userId: new require('mongoose').Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          acceptedSubmissions: {
            $sum: { $cond: [{ $eq: ["$status", "Accepted"] }, 1, 0] }
          },
          languages: { $addToSet: "$language" },
          recentSubmission: { $max: "$createdAt" }
        }
      }
    ]);

    const result = stats[0] || {
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      languages: [],
      recentSubmission: null
    };

    // Get unique problems solved
    const solvedProblems = await Submission.distinct('problemId', {
      userId,
      status: 'Accepted'
    });

    result.uniqueProblemsSolved = solvedProblems.length;
    result.accuracy = result.totalSubmissions > 0 ? 
      Math.round((result.acceptedSubmissions / result.totalSubmissions) * 100) : 0;

    res.json(result);
  } catch (error) {
    console.error("Error fetching submission stats:", error);
    res.status(500).json({ error: "Failed to fetch submission statistics" });
  }
});

// Get submission by ID (for viewing code)
router.get("/:submissionId", verifyToken, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const userId = req.user.id;

    const submission = await Submission.findById(submissionId)
      .populate('problemId', 'title difficulty')
      .populate('userId', 'name username');

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // Check if user owns this submission (or is admin)
    if (submission.userId._id.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized to view this submission" });
    }

    res.json({
      _id: submission._id,
      code: submission.code,
      language: submission.language,
      status: submission.status,
      runtime: submission.runtime,
      testCasesPassed: submission.testCasesPassed,
      totalTestCases: submission.totalTestCases,
      createdAt: submission.createdAt,
      problem: {
        _id: submission.problemId._id,
        title: submission.problemId.title,
        difficulty: submission.problemId.difficulty
      }
    });
  } catch (error) {
    console.error("Error fetching submission:", error);
    res.status(500).json({ error: "Failed to fetch submission" });
  }
});

// Delete a submission (only by owner or admin)
router.delete("/:submissionId", verifyToken, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const userId = req.user.id;

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // Check if user owns this submission (or is admin)
    if (submission.userId.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this submission" });
    }

    await Submission.findByIdAndDelete(submissionId);
    res.json({ message: "Submission deleted successfully" });
  } catch (error) {
    console.error("Error deleting submission:", error);
    res.status(500).json({ error: "Failed to delete submission" });
  }
});

module.exports = router;