const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Problem = require("./models/Problem");

dotenv.config();

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

const seedProblems = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await Problem.deleteMany(); // Clear existing problems
    await Problem.insertMany(dummyProblems);
    console.log("Dummy problems inserted");

    process.exit(); // Exit after completion
  } catch (err) {
    console.error("Error seeding problems:", err);
    process.exit(1);
  }
};

seedProblems();
