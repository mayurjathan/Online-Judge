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

    // Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      console.log("❌ Problem not found:", problemId);
      return res.status(404).json({ error: "Problem not found" });
    }
    console.log("✅ Problem found:", problem.title);

    // Verify user exists if userId provided
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        console.log("❌ User not found:", userId);
        return res.status(404).json({ error: "User not found" });
      }
      console.log("✅ User found:", user.name);
    }

    // Create submission
    const submissionData = {
      userId: userId || null,
      problemId,
      code,
      language,
      status,
      runtime: runtime || "0ms",
      testCasesPassed: testCasesPassed || 0,
      totalTestCases: totalTestCases || 0
    };

    console.log("Creating submission with data:", submissionData);

    const submission = new Submission(submissionData);
    const savedSubmission = await submission.save();
    
    console.log("✅ Submission saved successfully:", {
      id: savedSubmission._id,
      status: savedSubmission.status,
      createdAt: savedSubmission.createdAt
    });

    // Update user stats if needed
    if (status === "Accepted" && userId) {
      try {
        console.log("Updating user stats...");
        const user = await User.findById(userId);
        if (user) {
          // Check if this is first accepted submission for this problem
          const existingAccepted = await Submission.findOne({
            userId,
            problemId,
            status: "Accepted",
            _id: { $ne: savedSubmission._id }
          });

          if (!existingAccepted) {
            // First time solving this problem
            if (!user.solvedProblems) user.solvedProblems = [];
            if (!user.solvedProblems.includes(problemId)) {
              user.solvedProblems.push(problemId);
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
          }
          
          // Update total submissions count
          user.totalSubmissions = (user.totalSubmissions || 0) + 1;
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
      status: savedSubmission.status
    });

  } catch (error) {
    console.error("❌ Error saving submission:", error);
    console.error("Stack:", error.stack);
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

    const submissions = await Submission.find({
      userId,
      problemId
    }).sort({ createdAt: -1 }).limit(20);

    console.log("Found submissions:", submissions.length);
    res.json(submissions);
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
      .populate('problemId', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    console.log("Found recent submissions:", submissions.length);

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
    console.error("Error fetching recent submissions:", error);
    res.status(500).json({ error: "Failed to fetch recent submissions" });
  }
});

module.exports = router;