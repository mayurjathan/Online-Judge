// routes/problem.js
const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");

// POST /api/problems/seed => Adds dummy problems to DB
router.post("/seed", async (req, res) => {
  try {
    const dummyProblems = [
      {
        title: "Two Sum",
        description: "Given an array and target, return indices of the two numbers that add up to it.",
        difficulty: "Easy",
      },
      {
        title: "Longest Substring Without Repeating Characters",
        description: "Find the length of the longest substring without repeating characters.",
        difficulty: "Medium",
      },
      {
        title: "Median of Two Sorted Arrays",
        description: "Find the median of the two sorted arrays.",
        difficulty: "Hard",
      },
    ];

    await Problem.deleteMany({}); // optional: clear old problems
    await Problem.insertMany(dummyProblems);
    res.status(201).json({ message: "Dummy problems added" });
  } catch (err) {
    res.status(500).json({ error: "Failed to seed problems" });
  }
});

// GET /api/problems => fetch problems
router.get("/", async (req, res) => {
  try {
    const problems = await Problem.find();
    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch problems" });
  }
});

module.exports = router;
