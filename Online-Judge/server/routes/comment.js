const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const Problem = require("../models/Problem");
const verifyToken = require("../middleware/auth");

// Get comments for a specific problem
router.get("/problem/:problemId", async (req, res) => {
  try {
    const { problemId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const comments = await Comment.find({ problemId })
      .populate('userId', 'username email avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Comment.countDocuments({ problemId });

    res.json({
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// Add a comment to a problem
router.post("/problem/:problemId", verifyToken, async (req, res) => {
  try {
    const { problemId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    if (content.length > 1000) {
      return res.status(400).json({ error: "Comment is too long (max 1000 characters)" });
    }

    // Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const comment = new Comment({
      userId,
      problemId,
      content: content.trim(),
      likes: 0
    });

    await comment.save();

    // Populate user info before sending response
    await comment.populate('userId', 'username email avatar');

    res.status(201).json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
});

// Like/unlike a comment
router.post("/:commentId/like", verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // For simplicity, just increment likes (you can implement proper like tracking)
    comment.likes = (comment.likes || 0) + 1;
    await comment.save();

    res.json({ likes: comment.likes });
  } catch (error) {
    console.error("Error liking comment:", error);
    res.status(500).json({ error: "Failed to like comment" });
  }
});

// Delete a comment (only by author or admin)
router.delete("/:commentId", verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check if user is the author (you can add admin check here)
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

// Get user's comments
router.get("/user", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const comments = await Comment.find({ userId })
      .populate('problemId', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Comment.countDocuments({ userId });

    res.json({
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error("Error fetching user comments:", error);
    res.status(500).json({ error: "Failed to fetch user comments" });
  }
});

module.exports = router;