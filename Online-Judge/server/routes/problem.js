// routes/problem.js
const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");

// GET all problems
router.get("/", async (req, res) => {
  try {
    const problems = await Problem.find();
    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch problems" });
  }
});

// GET single problem by ID
router.get("/:id", async (req, res) => {
  try {
    const includeHidden = req.query.withHidden === "true";
    const problem = await Problem.findById(req.params.id).lean();
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    if (!includeHidden) {
      const { hiddenTestCases, ...rest } = problem;
      return res.json(rest);
    }

    // Return full problem if withHidden=true
    return res.json(problem);
  } catch (err) {
    console.error("Error fetching problem:", err);
    res.status(500).json({ error: "Failed to fetch problem" });
  }
});

module.exports = router;
