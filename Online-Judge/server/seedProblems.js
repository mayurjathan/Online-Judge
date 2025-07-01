const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Problem = require("./models/Problem");

dotenv.config();

const dummyProblems = [
  {
    title: "Two Sum",
    difficulty: "Easy",
    description:
      "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice. Return the answer in any order.",
    examples: [
      {
        input: "4\n2 7 11 15\n9",
        output: "0 1",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
    ],
    visibleTestCases: [
      { input: "4\n2 7 11 15\n9", output: "0 1" },
      { input: "3\n3 2 4\n6", output: "1 2" },
      { input: "2\n3 3\n6", output: "0 1" },
    ],
    hiddenTestCases: [
  { input: "3\n1 5 3\n4", output: "0 2" },
  { input: "4\n1 2 3 4\n5", output: "1 2" },       // changed expected to "1 2"
  { input: "4\n0 0 3 7\n7", output: "1 3" },       // changed expected to "1 3"
  { input: "4\n10 15 3 7\n22", output: "1 3" },    // changed expected to "1 3"
  { input: "4\n2 4 6 8\n14", output: "2 3" },
  { input: "4\n100 50 150 200\n250", output: "0 2" }, // changed expected to "0 2"
  { input: "3\n5 75 25\n100", output: "1 2" },
  { input: "4\n1 2 3 9\n11", output: "1 3" },       // changed expected to "1 3"
  { input: "4\n1 4 5 6\n10", output: "1 3" },
],
  },
  {
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    description:
      "Given a string `s`, find the length of the longest substring without repeating characters.",
    examples: [
      {
        input: "abcabcbb",
        output: "3",
        explanation: "The answer is 'abc', with the length of 3.",
      },
    ],
    constraints: ["0 <= s.length <= 5 * 10^4"],
    visibleTestCases: [
      { input: "abcabcbb", output: "3" },
      { input: "bbbbb", output: "1" },
      { input: "pwwkew", output: "3" },
    ],
    hiddenTestCases: [
      { input: "abcddefgh", output: "5" },
      { input: "aab", output: "2" },
      { input: "dvdf", output: "3" },
      { input: "anviaj", output: "5" },
      { input: "nfpdmpi", output: "5" },
      { input: "abcbdaac", output: "4" },
      { input: "a", output: "1" },
      { input: "ab", output: "2" },
      { input: "abcabcbbabc", output: "3" },
    ],
  },
  {
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    description:
      "Given two sorted arrays `nums1` and `nums2`, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).",
    examples: [
      {
        input: "2\n1 3\n1\n2",
        output: "2.0",
        explanation: "Merged = [1,2,3] → median = 2.0",
      },
    ],
    constraints: ["0 <= m, n <= 1000"],
    visibleTestCases: [
      { input: "2\n1 2\n2\n3 4", output: "2.5" },
      { input: "2\n0 0\n2\n0 0", output: "0.0" },
      { input: "0\n\n1\n1", output: "1.0" },
    ],
    hiddenTestCases: [
      { input: "1\n1\n3\n2 3 4", output: "2.5" },
      { input: "3\n1 2 5\n2\n3 4", output: "3.0" },
      { input: "3\n5 6 7\n4\n1 2 3 4", output: "4.0" },
      { input: "1\n100\n1\n200", output: "150.0" },
      { input: "2\n1 2\n0\n", output: "1.5" },
      { input: "1\n3\n2\n-2 -1", output: "-1.0" },
      { input: "1\n1\n4\n2 3 4 5", output: "3.0" },
      { input: "2\n1 1\n2\n1 1", output: "1.0" },
      { input: "2\n1 3\n2\n2 7", output: "2.5" },
    ],
  },
];

const seedProblems = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await Problem.deleteMany({});
    await Problem.insertMany(dummyProblems);

    console.log("Seeded problems successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding problems:", err);
    process.exit(1);
  }
};

seedProblems();
