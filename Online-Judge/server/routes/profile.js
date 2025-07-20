const express = require("express");
const router = express.Router();
const User = require("../models/User"); // adjust path if needed
const authMiddleware = require("../middleware/auth"); // assuming you have auth middleware

// @route   GET /api/profile
// @desc    Get current user's profile
// @access  Private
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // set by auth middleware

    const user = await User.findById(userId)
      .select("-password") // exclude password
      .populate("solvedProblems", "title") // optional: if you want problem titles
      .lean();

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Error fetching user profile:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
