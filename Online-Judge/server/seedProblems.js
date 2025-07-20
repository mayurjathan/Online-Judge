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
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    visibleTestCases: [
      { input: "4\n2 7 11 15\n9", output: "0 1" },
      { input: "3\n3 2 4\n6", output: "1 2" },
      { input: "2\n3 3\n6", output: "0 1" },
    ],
    hiddenTestCases: [
      { input: "3\n1 5 3\n4", output: "0 2" },
      { input: "4\n1 2 3 4\n5", output: "1 2" },
      { input: "4\n0 0 3 7\n0", output: "0 1" },
      { input: "4\n10 15 3 7\n22", output: "1 3" },
      { input: "4\n2 4 6 8\n14", output: "2 3" },
      { input: "4\n100 50 150 200\n250", output: "0 2" },
      { input: "3\n5 75 25\n100", output: "1 2" },
      { input: "4\n1 2 3 9\n11", output: "1 3" },
      { input: "4\n1 4 5 6\n10", output: "1 3" },
      { input: "5\n-1 -2 -3 -4 -5\n-8", output: "2 4" },
    ],
    tags: ["array", "hash-table"],
  },
  {
    title: "Add Two Numbers",
    difficulty: "Medium",
    description:
      "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
    examples: [
      {
        input: "l1 = [2,4,3], l2 = [5,6,4]",
        output: "[7,0,8]",
        explanation: "342 + 465 = 807.",
      },
    ],
    constraints: [
      "The number of nodes in each linked list is in the range [1, 100].",
      "0 <= Node.val <= 9",
      "It is guaranteed that the list represents a number that does not have leading zeros.",
    ],
    visibleTestCases: [
      { input: "3\n2 4 3\n3\n5 6 4", output: "7 0 8" },
      { input: "1\n0\n1\n0", output: "0" },
      { input: "7\n9 9 9 9 9 9 9\n4\n9 9 9 9", output: "8 9 9 9 0 0 0 1" },
    ],
    hiddenTestCases: [
      { input: "2\n2 4\n2\n5 6", output: "7 0 1" },
      { input: "1\n5\n1\n5", output: "0 1" },
      { input: "3\n1 0 0\n3\n0 0 1", output: "1 0 1" },
      { input: "1\n1\n2\n9 9", output: "0 0 1" },
      { input: "4\n1 2 3 4\n2\n5 6", output: "6 8 3 4" },
    ],
    tags: ["linked-list", "math", "recursion"],
  },
  {
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    description:
      "Given a string `s`, find the length of the longest substring without repeating characters.",
    examples: [
      {
        input: "s = \"abcabcbb\"",
        output: "3",
        explanation: "The answer is 'abc', with the length of 3.",
      },
      {
        input: "s = \"bbbbb\"",
        output: "1",
        explanation: "The answer is 'b', with the length of 1.",
      },
    ],
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces.",
    ],
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
      { input: "", output: "0" },
    ],
    tags: ["hash-table", "string", "sliding-window"],
  },
  {
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    description:
      "Given two sorted arrays `nums1` and `nums2`, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).",
    examples: [
      {
        input: "nums1 = [1,3], nums2 = [2]",
        output: "2.00000",
        explanation: "Merged array = [1,2,3] and median is 2.",
      },
      {
        input: "nums1 = [1,2], nums2 = [3,4]",
        output: "2.50000",
        explanation: "Merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.",
      },
    ],
    constraints: [
      "nums1.length == m",
      "nums2.length == n",
      "0 <= m <= 1000",
      "0 <= n <= 1000",
      "1 <= m + n <= 2000",
    ],
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
      { input: "1\n2\n1\n1", output: "1.5" },
    ],
    tags: ["array", "binary-search", "divide-and-conquer"],
  },
  {
    title: "Palindromic Substrings",
    difficulty: "Medium",
    description:
      "Given a string `s`, return the number of palindromic substrings in it. A string is a palindrome when it reads the same backward as forward. A substring is a contiguous sequence of characters within the string.",
    examples: [
      {
        input: "s = \"abc\"",
        output: "3",
        explanation: "Three palindromic strings: 'a', 'b', 'c'.",
      },
      {
        input: "s = \"aaa\"",
        output: "6",
        explanation: "Six palindromic strings: 'a', 'a', 'a', 'aa', 'aa', 'aaa'.",
      },
    ],
    constraints: [
      "1 <= s.length <= 1000",
      "s consists of lowercase English letters.",
    ],
    visibleTestCases: [
      { input: "abc", output: "3" },
      { input: "aaa", output: "6" },
      { input: "racecar", output: "10" },
    ],
    hiddenTestCases: [
      { input: "a", output: "1" },
      { input: "ab", output: "2" },
      { input: "aba", output: "4" },
      { input: "abcba", output: "7" },
      { input: "aabaa", output: "9" },
      { input: "raceacar", output: "12" },
      { input: "noon", output: "6" },
      { input: "level", output: "7" },
    ],
    tags: ["string", "dynamic-programming"],
  },
  {
    title: "Valid Parentheses",
    difficulty: "Easy",
    description:
      "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets, and open brackets must be closed in the correct order.",
    examples: [
      {
        input: "s = \"()\"",
        output: "true",
        explanation: "The string is valid.",
      },
      {
        input: "s = \"()[]{}\"",
        output: "true",
        explanation: "The string is valid.",
      },
      {
        input: "s = \"(]\"",
        output: "false",
        explanation: "The string is not valid.",
      },
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'.",
    ],
    visibleTestCases: [
      { input: "()", output: "true" },
      { input: "()[]{}", output: "true" },
      { input: "(]", output: "false" },
    ],
    hiddenTestCases: [
      { input: "((", output: "false" },
      { input: "))", output: "false" },
      { input: "({[]})", output: "true" },
      { input: "([)]", output: "false" },
      { input: "{[]}", output: "true" },
      { input: "((()))", output: "true" },
      { input: "((())", output: "false" },
      { input: "(()())", output: "true" },
    ],
    tags: ["string", "stack"],
  },
  {
    title: "Maximum Subarray",
    difficulty: "Medium",
    description:
      "Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum. A subarray is a contiguous part of an array.",
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "[4,-1,2,1] has the largest sum = 6.",
      },
      {
        input: "nums = [1]",
        output: "1",
        explanation: "The array has only one element.",
      },
    ],
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4",
    ],
    visibleTestCases: [
      { input: "9\n-2 1 -3 4 -1 2 1 -5 4", output: "6" },
      { input: "1\n1", output: "1" },
      { input: "5\n5 4 -1 7 8", output: "23" },
    ],
    hiddenTestCases: [
      { input: "3\n-2 -1 -3", output: "-1" },
      { input: "4\n-1 -2 -3 -4", output: "-1" },
      { input: "2\n1 2", output: "3" },
      { input: "6\n-2 1 -3 4 -1 2", output: "5" },
      { input: "5\n1 -3 2 1 -1", output: "3" },
      { input: "4\n-1 0 -2 3", output: "3" },
    ],
    tags: ["array", "divide-and-conquer", "dynamic-programming"],
  },
  {
    title: "Climbing Stairs",
    difficulty: "Easy",
    description:
      "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    examples: [
      {
        input: "n = 2",
        output: "2",
        explanation: "There are two ways: 1. 1 step + 1 step 2. 2 steps",
      },
      {
        input: "n = 3",
        output: "3",
        explanation: "There are three ways: 1. 1 step + 1 step + 1 step 2. 1 step + 2 steps 3. 2 steps + 1 step",
      },
    ],
    constraints: [
      "1 <= n <= 45",
    ],
    visibleTestCases: [
      { input: "2", output: "2" },
      { input: "3", output: "3" },
      { input: "4", output: "5" },
    ],
    hiddenTestCases: [
      { input: "1", output: "1" },
      { input: "5", output: "8" },
      { input: "6", output: "13" },
      { input: "7", output: "21" },
      { input: "8", output: "34" },
      { input: "10", output: "89" },
      { input: "15", output: "987" },
      { input: "20", output: "10946" },
    ],
    tags: ["math", "dynamic-programming", "memoization"],
  },
  {
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    description:
      "You are given an array `prices` where `prices[i]` is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
    examples: [
      {
        input: "prices = [7,1,5,3,6,4]",
        output: "5",
        explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.",
      },
      {
        input: "prices = [7,6,4,3,1]",
        output: "0",
        explanation: "In this case, no transactions are done and the max profit = 0.",
      },
    ],
    constraints: [
      "1 <= prices.length <= 10^5",
      "0 <= prices[i] <= 10^4",
    ],
    visibleTestCases: [
      { input: "6\n7 1 5 3 6 4", output: "5" },
      { input: "5\n7 6 4 3 1", output: "0" },
      { input: "2\n1 2", output: "1" },
    ],
    hiddenTestCases: [
      { input: "1\n1", output: "0" },
      { input: "3\n2 4 1", output: "2" },
      { input: "4\n3 2 6 5", output: "4" },
      { input: "5\n1 2 3 4 5", output: "4" },
      { input: "5\n5 4 3 2 1", output: "0" },
      { input: "6\n2 1 2 1 0 1", output: "1" },
    ],
    tags: ["array", "dynamic-programming"],
  },
  {
    title: "Binary Tree Inorder Traversal",
    difficulty: "Easy",
    description:
      "Given the root of a binary tree, return the inorder traversal of its nodes' values. The inorder traversal visits nodes in the order: left subtree, root, right subtree.",
    examples: [
      {
        input: "root = [1,null,2,3]",
        output: "[1,3,2]",
        explanation: "Inorder traversal of the tree.",
      },
    ],
    constraints: [
      "The number of nodes in the tree is in the range [0, 100].",
      "-100 <= Node.val <= 100",
    ],
    visibleTestCases: [
      { input: "7\n1 -1 2 -1 -1 3 -1", output: "1 3 2" },
      { input: "0", output: "" },
      { input: "1\n1", output: "1" },
    ],
    hiddenTestCases: [
      { input: "3\n1 2 3", output: "2 1 3" },
      { input: "5\n3 1 4 -1 2", output: "1 2 3 4" },
      { input: "7\n5 3 7 2 4 6 8", output: "2 3 4 5 6 7 8" },
      { input: "4\n1 -1 2 -1 3", output: "1 3 2" },
    ],
    tags: ["stack", "tree", "depth-first-search", "binary-tree"],
  },
];

const seedProblems = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB successfully!");

    console.log("Clearing existing problems...");
    const deleteResult = await Problem.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing problems.`);

    console.log("Inserting new problems...");
    const insertResult = await Problem.insertMany(dummyProblems);
    console.log(`Successfully inserted ${insertResult.length} problems:`);
    
    insertResult.forEach((problem, index) => {
      console.log(`${index + 1}. ${problem.title} (${problem.difficulty})`);
    });

    console.log("\n✅ Database seeded successfully!");
    console.log(`Total problems in database: ${insertResult.length}`);
    
    // Verify the insertion
    const count = await Problem.countDocuments();
    console.log(`Verification: ${count} problems found in database.`);

  } catch (err) {
    console.error("❌ Error seeding problems:", err);
    if (err.code === 11000) {
      console.error("Duplicate key error - problem titles must be unique");
    }
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, closing database connection...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, closing database connection...');
  await mongoose.connection.close();
  process.exit(0);
});

console.log("🚀 Starting database seeding process...");
seedProblems();