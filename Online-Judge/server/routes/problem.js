// server/routes/problem.js
const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");
const Comment = require("../models/Comment");
const Submission = require("../models/Submission");
const verifyToken = require("../middleware/auth");

// Get all problems - PUBLIC route (no auth required)
router.get("/", async (req, res) => {
  try {
    console.log("Fetching all problems...");
    const problems = await Problem.find({}).select('-hiddenTestCases');
    console.log("Found problems:", problems.length);
    res.json(problems);
  } catch (error) {
    console.error("Error fetching problems:", error);
    res.status(500).json({ error: "Failed to fetch problems" });
  }
});

// Get a specific problem - PUBLIC route
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching problem:", id);
    
    // Validate ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid problem ID format" });
    }

    const problem = await Problem.findById(id).select('-hiddenTestCases');
    if (!problem) {
      console.log("Problem not found:", id);
      return res.status(404).json({ error: "Problem not found" });
    }
    
    console.log("Problem found:", problem.title);
    res.json(problem);
  } catch (error) {
    console.error("Error fetching problem:", error);
    res.status(500).json({ error: "Failed to fetch problem" });
  }
});

// SECURE ENDPOINT: Get test cases for compiler service only
router.post("/:id/test-cases", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const serviceHeader = req.headers['x-service'];
    
    console.log("Test cases request:", {
      problemId: id,
      userId: req.user?.id,
      service: serviceHeader,
      timestamp: new Date().toISOString()
    });

    // Verify this request is from the compiler service
    if (serviceHeader !== 'compiler') {
      console.log("❌ Request not from compiler service");
      return res.status(403).json({ 
        error: "Forbidden", 
        message: "This endpoint is only accessible by the compiler service" 
      });
    }

    // Verify user authentication
    if (!req.user || !req.user.id) {
      console.log("❌ No user authentication");
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "Valid user authentication required" 
      });
    }

    // Validate ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("❌ Invalid problem ID format:", id);
      return res.status(400).json({ error: "Invalid problem ID format" });
    }

    const problem = await Problem.findById(id).lean();
    if (!problem) {
      console.log("❌ Problem not found:", id);
      return res.status(404).json({ 
        error: "Problem not found",
        message: "The specified problem does not exist"
      });
    }

    if (!problem.hiddenTestCases || problem.hiddenTestCases.length === 0) {
      console.log("❌ No test cases found for problem:", id);
      return res.status(404).json({ 
        error: "No test cases found",
        message: "This problem doesn't have test cases configured"
      });
    }

    // SECURE: Return only input/output pairs, no other problem data
    const secureTestCases = problem.hiddenTestCases.map(testCase => ({
      input: testCase.input,
      output: testCase.output
    }));

    console.log(`✅ Test cases provided for problem ${id} by user ${req.user.id} from compiler service (${secureTestCases.length} cases)`);

    res.json({
      testCases: secureTestCases,
      count: secureTestCases.length
    });

  } catch (error) {
    console.error("❌ Error fetching test cases:", error);
    res.status(500).json({ 
      error: "Server error",
      message: "Failed to fetch test cases"
    });
  }
});

// Get comments for a specific problem
router.get("/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    console.log(`Fetching comments for problem ${id}, page ${page}, limit ${limit}`);

    // Validate ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid problem ID format" });
    }

    // Verify problem exists
    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    // Convert page and limit to integers and handle pagination properly
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const comments = await Comment.find({ problemId: id })
      .populate('userId', 'name username email avatar')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const total = await Comment.countDocuments({ problemId: id });

    console.log(`Found ${comments.length} comments for problem ${id}`);

    res.json({
      comments,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// Add a comment to a problem
router.post("/:id/comments", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    console.log(`Creating comment for problem ${id} by user ${userId}`);

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    if (content.length > 1000) {
      return res.status(400).json({ error: "Comment is too long (max 1000 characters)" });
    }

    // Validate ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid problem ID format" });
    }

    // Verify problem exists
    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const comment = new Comment({
      userId,
      problemId: id,
      content: content.trim(),
      likes: 0,
      createdAt: new Date()
    });

    await comment.save();

    // Populate user info before sending response
    await comment.populate('userId', 'name username email avatar');

    console.log(`Comment created successfully for problem ${id}`);
    res.status(201).json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
});

// Like/unlike a comment
router.post("/comments/:commentId/like", verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // For simplicity, just increment likes (implement proper like tracking later)
    comment.likes = (comment.likes || 0) + 1;
    await comment.save();

    res.json({ 
      likes: comment.likes,
      message: "Comment liked successfully"
    });
  } catch (error) {
    console.error("Error liking comment:", error);
    res.status(500).json({ error: "Failed to like comment" });
  }
});

// Delete a comment (only by author or admin)
router.delete("/comments/:commentId", verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check if user is the author (add admin check here if needed)
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this comment" });
    }

    await Comment.findByIdAndDelete(commentId);
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

// Get submissions for a specific problem by the authenticated user
router.get("/:id/submissions", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log("Fetching submissions for problem:", id, "user:", userId);

    // Validate ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid problem ID format" });
    }

    const submissions = await Submission.find({
      userId,
      problemId: id
    })
    .populate('problemId', 'title')
    .sort({ createdAt: -1 })
    .limit(50);

    console.log("Found submissions:", submissions.length);
    
    // Format submissions for frontend
    const formattedSubmissions = submissions.map(sub => ({
      _id: sub._id,
      status: sub.status,
      language: sub.language,
      runtime: sub.runtime,
      createdAt: sub.createdAt,
      testCasesPassed: sub.testCasesPassed,
      totalTestCases: sub.totalTestCases
    }));

    res.json(formattedSubmissions);
  } catch (error) {
    console.error("Error fetching problem submissions:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// Get problem statistics
router.get("/:id/stats", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid problem ID format" });
    }

    // Verify problem exists
    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    // Get submission statistics
    const totalSubmissions = await Submission.countDocuments({ problemId: id });
    const acceptedSubmissions = await Submission.countDocuments({ 
      problemId: id, 
      status: "Accepted" 
    });
    
    // Get unique users who solved the problem
    const solvedByUsers = await Submission.distinct('userId', { 
      problemId: id, 
      status: "Accepted" 
    });

    // Calculate acceptance rate
    const acceptanceRate = totalSubmissions > 0 ? 
      Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

    const stats = {
      totalSubmissions,
      acceptedSubmissions,
      uniqueSolvers: solvedByUsers.length,
      acceptanceRate,
      difficulty: problem.difficulty
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching problem stats:", error);
    res.status(500).json({ error: "Failed to fetch problem statistics" });
  }
});

// Search problems
router.get("/search/:query", async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: "Search query is required" });
    }

    // Create search filter
    const searchFilter = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };

    const problems = await Problem.find(searchFilter)
      .select('-hiddenTestCases')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Problem.countDocuments(searchFilter);

    res.json({
      problems,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
      query
    });
  } catch (error) {
    console.error("Error searching problems:", error);
    res.status(500).json({ error: "Failed to search problems" });
  }
});

// ADMIN ENDPOINTS (commented out admin checks - implement role-based auth as needed)

// Get full problem with hidden test cases (admin only)
router.get("/:id/admin", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid problem ID format" });
    }

    const problem = await Problem.findById(id).lean();
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }
    res.json(problem);
  } catch (error) {
    console.error("Error fetching admin problem data:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new problem (admin only)
router.post("/", verifyToken, async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      examples,
      constraints,
      visibleTestCases,
      hiddenTestCases,
      tags
    } = req.body;

    // Validate required fields
    if (!title || !description || !difficulty) {
      return res.status(400).json({ 
        error: "Missing required fields",
        message: "Title, description, and difficulty are required"
      });
    }

    // Validate difficulty
    if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({ 
        error: "Invalid difficulty",
        message: "Difficulty must be Easy, Medium, or Hard"
      });
    }

    const problem = new Problem({
      title,
      description,
      difficulty,
      examples: examples || [],
      constraints: constraints || [],
      visibleTestCases: visibleTestCases || [],
      hiddenTestCases: hiddenTestCases || [],
      tags: tags || []
    });

    await problem.save();

    // Don't return hidden test cases in response
    const responseData = { ...problem.toObject() };
    delete responseData.hiddenTestCases;

    res.status(201).json(responseData);
  } catch (error) {
    console.error("Error creating problem:", error);
    if (error.code === 11000) {
      res.status(400).json({ error: "Problem with this title already exists" });
    } else {
      res.status(500).json({ error: "Failed to create problem" });
    }
  }
});

// Update a problem (admin only)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid problem ID format" });
    }

    // Validate difficulty if provided
    if (updates.difficulty && !['Easy', 'Medium', 'Hard'].includes(updates.difficulty)) {
      return res.status(400).json({ 
        error: "Invalid difficulty",
        message: "Difficulty must be Easy, Medium, or Hard"
      });
    }

    const updatedProblem = await Problem.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedProblem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    // Don't return hidden test cases in response
    const responseData = { ...updatedProblem.toObject() };
    delete responseData.hiddenTestCases;

    res.json(responseData);
  } catch (error) {
    console.error("Error updating problem:", error);
    res.status(500).json({ error: "Failed to update problem" });
  }
});

// Delete a problem (admin only)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid problem ID format" });
    }

    const deletedProblem = await Problem.findByIdAndDelete(id);
    if (!deletedProblem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    // Also delete related comments and submissions
    await Comment.deleteMany({ problemId: id });
    await Submission.deleteMany({ problemId: id });

    res.json({ message: "Problem deleted successfully" });
  } catch (error) {
    console.error("Error deleting problem:", error);
    res.status(500).json({ error: "Failed to delete problem" });
  }
});
// Add these routes to your backend (Render server)

// Route 1: Get secure test cases (only inputs, no expected outputs)
router.post("/problems/:problemId/secure-test-cases", async (req, res) => {
  try {
    const { problemId } = req.params;
    
    // Get full test cases from your database
    const problem = await Problem.findById(problemId);
    if (!problem || !problem.testCases) {
      return res.status(404).json({ error: "Test cases not found" });
    }
    
    // Return only inputs, hide expected outputs
    const secureTestCases = problem.testCases.map(test => ({
      input: test.input
      // No output field - this keeps expected outputs hidden
    }));
    
    res.json({ testCases: secureTestCases });
  } catch (error) {
    console.error("Error fetching secure test cases:", error);
    res.status(500).json({ error: "Failed to fetch test cases" });
  }
});

// Route 2: Verify output without exposing expected result
router.post("/problems/:problemId/verify-output", async (req, res) => {
  try {
    const { problemId } = req.params;
    const { testIndex, actualOutput } = req.body;
    
    // Get the problem and test case
    const problem = await Problem.findById(problemId);
    if (!problem || !problem.testCases || !problem.testCases[testIndex]) {
      return res.status(404).json({ error: "Test case not found" });
    }
    
    const expectedOutput = problem.testCases[testIndex].output;
    const isCorrect = actualOutput.trim() === expectedOutput.trim();
    
    // Return only boolean result, not the expected output
    res.json({ isCorrect });
  } catch (error) {
    console.error("Error verifying output:", error);
    res.status(500).json({ error: "Failed to verify output" });
  }
});

module.exports = router;