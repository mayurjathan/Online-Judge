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
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }
    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch the problem" });
  }
});

module.exports = router;
