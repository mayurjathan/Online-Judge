const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Problem = require("./models/Problem");

dotenv.config();

const dummyProblems = [
  // EASY PROBLEMS (1-50)
  {
    title: "Two Sum",
    difficulty: "Easy",
    description: "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." }
    ],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"],
    visibleTestCases: [
      { input: "4\n2 7 11 15\n9", output: "0 1" },
      { input: "3\n3 2 4\n6", output: "1 2" }
    ],
    hiddenTestCases: [
      { input: "3\n1 5 3\n4", output: "0 2" }, { input: "4\n1 2 3 4\n5", output: "1 2" },
      { input: "4\n0 0 3 7\n0", output: "0 1" }, { input: "4\n10 15 3 7\n22", output: "1 3" },
      { input: "4\n2 4 6 8\n14", output: "2 3" }, { input: "4\n100 50 150 200\n250", output: "0 2" },
      { input: "3\n5 75 25\n100", output: "1 2" }, { input: "4\n1 2 3 9\n11", output: "1 3" },
      { input: "4\n1 4 5 6\n10", output: "1 3" }, { input: "5\n-1 -2 -3 -4 -5\n-8", output: "2 4" },
      { input: "3\n-3 4 3\n0", output: "0 2" }, { input: "4\n1 1 1 1\n2", output: "0 1" },
      { input: "5\n2 5 5 11 15\n10", output: "1 2" }, { input: "4\n3 5 7 9\n12", output: "1 2" },
      { input: "3\n0 1 0\n0", output: "0 2" }
    ],
    tags: ["array", "hash-table"]
  },
  {
    title: "Valid Parentheses",
    difficulty: "Easy",
    description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    examples: [
      { input: "s = \"()\"", output: "true", explanation: "The string is valid." }
    ],
    constraints: ["1 <= s.length <= 10^4"],
    visibleTestCases: [
      { input: "()", output: "true" },
      { input: "()[]{}", output: "true" },
      { input: "(]", output: "false" }
    ],
    hiddenTestCases: [
      { input: "((", output: "false" }, { input: "))", output: "false" }, { input: "({[]})", output: "true" },
      { input: "([)]", output: "false" }, { input: "{[]}", output: "true" }, { input: "((()))", output: "true" },
      { input: "((())", output: "false" }, { input: "(()())", output: "true" }, { input: "(){}[]", output: "true" },
      { input: "([{}])", output: "true" }, { input: "([{]})", output: "false" }, { input: "((({{{[[[", output: "false" },
      { input: ")]}", output: "false" }, { input: "{[()]}", output: "true" }, { input: "({[", output: "false" },
      { input: "())", output: "false" }, { input: "(()", output: "false" }, { input: "{[({})]}", output: "true" }
    ],
    tags: ["string", "stack"]
  },
  {
    title: "Palindrome Number",
    difficulty: "Easy",
    description: "Given an integer `x`, return `true` if `x` is palindrome integer.",
    examples: [
      { input: "x = 121", output: "true", explanation: "121 reads as 121 from left to right and from right to left." }
    ],
    constraints: ["-2^31 <= x <= 2^31 - 1"],
    visibleTestCases: [
      { input: "121", output: "true" },
      { input: "-121", output: "false" },
      { input: "10", output: "false" }
    ],
    hiddenTestCases: [
      { input: "0", output: "true" }, { input: "1", output: "true" }, { input: "11", output: "true" },
      { input: "101", output: "true" }, { input: "1001", output: "true" }, { input: "12321", output: "true" },
      { input: "123321", output: "true" }, { input: "1234321", output: "true" }, { input: "12", output: "false" },
      { input: "123", output: "false" }, { input: "1234", output: "false" }, { input: "-1", output: "false" },
      { input: "-11", output: "false" }, { input: "9", output: "true" }, { input: "99", output: "true" },
      { input: "999", output: "true" }, { input: "9999", output: "true" }, { input: "12345", output: "false" }
    ],
    tags: ["math"]
  },
  {
    title: "Roman to Integer",
    difficulty: "Easy",
    description: "Given a roman numeral, convert it to an integer.",
    examples: [
      { input: "s = \"III\"", output: "3", explanation: "III = 3." }
    ],
    constraints: ["1 <= s.length <= 15"],
    visibleTestCases: [
      { input: "III", output: "3" },
      { input: "IV", output: "4" },
      { input: "IX", output: "9" }
    ],
    hiddenTestCases: [
      { input: "I", output: "1" }, { input: "V", output: "5" }, { input: "X", output: "10" },
      { input: "L", output: "50" }, { input: "C", output: "100" }, { input: "D", output: "500" },
      { input: "M", output: "1000" }, { input: "XL", output: "40" }, { input: "XC", output: "90" },
      { input: "CD", output: "400" }, { input: "CM", output: "900" }, { input: "LVIII", output: "58" },
      { input: "MCMXC", output: "1990" }, { input: "MMCDXLIV", output: "2444" }, { input: "MCDLIV", output: "1454" },
      { input: "MCMLIV", output: "1954" }, { input: "MMXIV", output: "2014" }, { input: "MMMCMXCIX", output: "3999" }
    ],
    tags: ["hash-table", "math", "string"]
  },
  {
    title: "Longest Common Prefix",
    difficulty: "Easy",
    description: "Write a function to find the longest common prefix string amongst an array of strings.",
    examples: [
      { input: "strs = [\"flower\",\"flow\",\"flight\"]", output: "\"fl\"", explanation: "The longest common prefix is 'fl'." }
    ],
    constraints: ["1 <= strs.length <= 200"],
    visibleTestCases: [
      { input: "3\nflower\nflow\nflight", output: "fl" },
      { input: "3\ndog\nracecar\ncar", output: "" }
    ],
    hiddenTestCases: [
      { input: "1\nhello", output: "hello" }, { input: "2\nabc\nabc", output: "abc" },
      { input: "3\na\nab\nabc", output: "a" }, { input: "2\n\na", output: "" },
      { input: "3\ntest\ntesting\ntester", output: "test" }, { input: "4\nab\na\nc\nd", output: "" },
      { input: "3\ninterspecies\ninterstellar\ninterstate", output: "inters" }, { input: "2\nprefix\npreparation", output: "pre" },
      { input: "3\naaa\naa\na", output: "a" }, { input: "3\nabc\ndef\nghi", output: "" },
      { input: "2\nab\nab", output: "ab" }, { input: "4\ncat\ncats\ncatch\ncaterpillar", output: "cat" },
      { input: "2\ngeeksforgeeks\ngeeks", output: "geeks" }, { input: "3\nhello\nworld\ntest", output: "" }
    ],
    tags: ["string"]
  },
  {
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    description: "You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists in a one sorted list.",
    examples: [
      { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]", explanation: "Merge two sorted lists." }
    ],
    constraints: ["The number of nodes in both lists is in the range [0, 50]."],
    visibleTestCases: [
      { input: "3\n1 2 4\n3\n1 3 4", output: "1 1 2 3 4 4" },
      { input: "0\n\n0\n", output: "" }
    ],
    hiddenTestCases: [
      { input: "1\n1\n0\n", output: "1" }, { input: "0\n\n1\n2", output: "2" },
      { input: "2\n1 3\n2\n2 4", output: "1 2 3 4" }, { input: "1\n5\n1\n1", output: "1 5" },
      { input: "3\n1 2 3\n3\n4 5 6", output: "1 2 3 4 5 6" }, { input: "2\n1 1\n2\n2 2", output: "1 1 2 2" },
      { input: "4\n1 2 3 4\n0\n", output: "1 2 3 4" }, { input: "1\n0\n1\n0", output: "0 0" },
      { input: "3\n-1 0 1\n2\n-2 2", output: "-2 -1 0 1 2" }, { input: "2\n5 6\n3\n1 2 3", output: "1 2 3 5 6" }
    ],
    tags: ["linked-list", "recursion"]
  },
  {
    title: "Remove Duplicates from Sorted Array",
    difficulty: "Easy",
    description: "Given an integer array `nums` sorted in non-decreasing order, remove the duplicates in-place and return the new length.",
    examples: [
      { input: "nums = [1,1,2]", output: "2", explanation: "Your function should return k = 2, with the first two elements of nums being 1 and 2." }
    ],
    constraints: ["1 <= nums.length <= 3 * 10^4"],
    visibleTestCases: [
      { input: "3\n1 1 2", output: "2" },
      { input: "10\n0 0 1 1 1 2 2 3 3 4", output: "5" }
    ],
    hiddenTestCases: [
      { input: "1\n1", output: "1" }, { input: "2\n1 2", output: "2" }, { input: "2\n1 1", output: "1" },
      { input: "3\n1 2 3", output: "3" }, { input: "4\n1 1 1 1", output: "1" }, { input: "5\n1 2 2 3 3", output: "3" },
      { input: "6\n1 1 2 2 3 3", output: "3" }, { input: "7\n0 0 1 1 1 2 2", output: "3" },
      { input: "4\n-1 0 0 1", output: "3" }, { input: "5\n1 2 3 4 5", output: "5" },
      { input: "8\n1 1 1 2 2 2 3 3", output: "3" }, { input: "6\n-3 -1 0 0 0 3", output: "4" }
    ],
    tags: ["array", "two-pointers"]
  },
  {
    title: "Remove Element",
    difficulty: "Easy",
    description: "Given an integer array `nums` and an integer `val`, remove all occurrences of `val` in `nums` in-place.",
    examples: [
      { input: "nums = [3,2,2,3], val = 3", output: "2", explanation: "Your function should return k = 2, with the first two elements of nums being 2." }
    ],
    constraints: ["0 <= nums.length <= 100"],
    visibleTestCases: [
      { input: "4\n3 2 2 3\n3", output: "2" },
      { input: "8\n0 1 2 2 3 0 4 2\n2", output: "5" }
    ],
    hiddenTestCases: [
      { input: "0\n\n1", output: "0" }, { input: "1\n1\n1", output: "0" }, { input: "1\n2\n1", output: "1" },
      { input: "3\n1 2 3\n4", output: "3" }, { input: "4\n1 1 1 1\n1", output: "0" },
      { input: "5\n1 2 3 4 5\n3", output: "4" }, { input: "6\n0 0 0 0 0 0\n0", output: "0" },
      { input: "3\n1 2 1\n1", output: "1" }, { input: "4\n2 3 2 3\n2", output: "2" },
      { input: "5\n5 5 5 5 5\n5", output: "0" }, { input: "7\n1 2 3 1 2 3 1\n1", output: "4" }
    ],
    tags: ["array", "two-pointers"]
  },
  {
    title: "Plus One",
    difficulty: "Easy",
    description: "You are given a large integer represented as an integer array `digits`. Increment the large integer by one and return the resulting array of digits.",
    examples: [
      { input: "digits = [1,2,3]", output: "[1,2,4]", explanation: "The array represents the integer 123. Incrementing by one gives 123 + 1 = 124." }
    ],
    constraints: ["1 <= digits.length <= 100"],
    visibleTestCases: [
      { input: "3\n1 2 3", output: "1 2 4" },
      { input: "4\n4 3 2 1", output: "4 3 2 2" },
      { input: "1\n9", output: "1 0" }
    ],
    hiddenTestCases: [
      { input: "2\n9 9", output: "1 0 0" }, { input: "3\n9 9 9", output: "1 0 0 0" },
      { input: "1\n0", output: "1" }, { input: "2\n1 0", output: "1 1" },
      { input: "4\n1 2 9 9", output: "1 3 0 0" }, { input: "3\n8 9 9", output: "9 0 0" },
      { input: "2\n9 8", output: "9 9" }, { input: "5\n1 2 3 4 5", output: "1 2 3 4 6" },
      { input: "1\n1", output: "2" }, { input: "1\n5", output: "6" },
      { input: "4\n9 9 9 8", output: "9 9 9 9" }, { input: "6\n1 0 0 0 0 0", output: "1 0 0 0 0 1" }
    ],
    tags: ["array", "math"]
  },
  {
    title: "Add Binary",
    difficulty: "Easy",
    description: "Given two binary strings `a` and `b`, return their sum as a binary string.",
    examples: [
      { input: "a = \"11\", b = \"1\"", output: "\"100\"", explanation: "11 + 1 = 100 in binary." }
    ],
    constraints: ["1 <= a.length, b.length <= 10^4"],
    visibleTestCases: [
      { input: "11\n1", output: "100" },
      { input: "1010\n1011", output: "10101" }
    ],
    hiddenTestCases: [
      { input: "0\n0", output: "0" }, { input: "1\n1", output: "10" }, { input: "0\n1", output: "1" },
      { input: "1\n0", output: "1" }, { input: "111\n1", output: "1000" },
      { input: "1111\n1111", output: "11110" }, { input: "10\n01", output: "11" },
      { input: "1010\n1010", output: "10100" }, { input: "1111\n1", output: "10000" },
      { input: "101\n11", output: "1000" }, { input: "110\n110", output: "1100" },
      { input: "1000\n111", output: "1111" }, { input: "11111\n1", output: "100000" }
    ],
    tags: ["math", "string", "bit-manipulation", "simulation"]
  },
  {
    title: "Sqrt(x)",
    difficulty: "Easy",
    description: "Given a non-negative integer `x`, compute and return the square root of `x`.",
    examples: [
      { input: "x = 4", output: "2", explanation: "The square root of 4 is 2." }
    ],
    constraints: ["0 <= x <= 2^31 - 1"],
    visibleTestCases: [
      { input: "4", output: "2" },
      { input: "8", output: "2" },
      { input: "0", output: "0" }
    ],
    hiddenTestCases: [
      { input: "1", output: "1" }, { input: "9", output: "3" }, { input: "16", output: "4" },
      { input: "25", output: "5" }, { input: "36", output: "6" }, { input: "49", output: "7" },
      { input: "64", output: "8" }, { input: "81", output: "9" }, { input: "100", output: "10" },
      { input: "121", output: "11" }, { input: "144", output: "12" }, { input: "15", output: "3" },
      { input: "24", output: "4" }, { input: "35", output: "5" }, { input: "48", output: "6" },
      { input: "63", output: "7" }, { input: "80", output: "8" }, { input: "99", output: "9" }
    ],
    tags: ["math", "binary-search"]
  },
  {
    title: "Climbing Stairs",
    difficulty: "Easy",
    description: "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps.",
    examples: [
      { input: "n = 2", output: "2", explanation: "There are two ways: 1. 1 step + 1 step 2. 2 steps" }
    ],
    constraints: ["1 <= n <= 45"],
    visibleTestCases: [
      { input: "2", output: "2" },
      { input: "3", output: "3" },
      { input: "4", output: "5" }
    ],
    hiddenTestCases: [
      { input: "1", output: "1" }, { input: "5", output: "8" }, { input: "6", output: "13" },
      { input: "7", output: "21" }, { input: "8", output: "34" }, { input: "9", output: "55" },
      { input: "10", output: "89" }, { input: "11", output: "144" }, { input: "12", output: "233" },
      { input: "13", output: "377" }, { input: "14", output: "610" }, { input: "15", output: "987" },
      { input: "16", output: "1597" }, { input: "17", output: "2584" }, { input: "18", output: "4181" },
      { input: "19", output: "6765" }, { input: "20", output: "10946" }
    ],
    tags: ["math", "dynamic-programming", "memoization"]
  },
  {
    title: "Remove Duplicates from Sorted List",
    difficulty: "Easy",
    description: "Given the head of a sorted linked list, delete all duplicates such that each element appears only once.",
    examples: [
      { input: "head = [1,1,2]", output: "[1,2]", explanation: "Remove duplicate 1." }
    ],
    constraints: ["The number of nodes in the list is in the range [0, 300]."],
    visibleTestCases: [
      { input: "3\n1 1 2", output: "1 2" },
      { input: "6\n1 1 2 3 3 3", output: "1 2 3" }
    ],
    hiddenTestCases: [
      { input: "0\n", output: "" }, { input: "1\n1", output: "1" }, { input: "2\n1 2", output: "1 2" },
      { input: "2\n1 1", output: "1" }, { input: "3\n1 1 1", output: "1" },
      { input: "4\n1 2 2 3", output: "1 2 3" }, { input: "5\n1 1 2 2 3", output: "1 2 3" },
      { input: "4\n0 0 0 0", output: "0" }, { input: "3\n-1 0 0", output: "-1 0" },
      { input: "5\n1 2 3 4 5", output: "1 2 3 4 5" }, { input: "6\n1 1 1 2 2 2", output: "1 2" }
    ],
    tags: ["linked-list"]
  },
  {
    title: "Merge Sorted Array",
    difficulty: "Easy",
    description: "You are given two integer arrays `nums1` and `nums2`, sorted in non-decreasing order, and two integers `m` and `n`.",
    examples: [
      { input: "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3", output: "[1,2,2,3,5,6]", explanation: "Merge arrays." }
    ],
    constraints: ["nums1.length == m + n"],
    visibleTestCases: [
      { input: "6\n1 2 3 0 0 0\n3\n3\n2 5 6", output: "1 2 2 3 5 6" },
      { input: "1\n1\n1\n0\n", output: "1" }
    ],
    hiddenTestCases: [
      { input: "1\n0\n0\n1\n1", output: "1" }, { input: "2\n1 0\n1\n1\n2", output: "1 2" },
      { input: "3\n2 0 0\n1\n2\n1", output: "1 2" }, { input: "4\n1 2 0 0\n2\n2\n3 4", output: "1 2 3 4" },
      { input: "5\n0 0 0 0 0\n0\n5\n1 2 3 4 5", output: "1 2 3 4 5" },
      { input: "4\n4 5 0 0\n2\n2\n1 3", output: "1 3 4 5" },
      { input: "3\n-1 0 0\n1\n2\n0 3", output: "-1 0 3" },
      { input: "6\n1 2 4 0 0 0\n3\n3\n2 3 5", output: "1 2 2 3 4 5" }
    ],
    tags: ["array", "two-pointers", "sorting"]
  },
  {
    title: "Binary Tree Inorder Traversal",
    difficulty: "Easy",
    description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
    examples: [
      { input: "root = [1,null,2,3]", output: "[1,3,2]", explanation: "Inorder traversal of the tree." }
    ],
    constraints: ["The number of nodes in the tree is in the range [0, 100]."],
    visibleTestCases: [
      { input: "7\n1 -1 2 -1 -1 3 -1", output: "1 3 2" },
      { input: "0", output: "" },
      { input: "1\n1", output: "1" }
    ],
    hiddenTestCases: [
      { input: "3\n1 2 3", output: "2 1 3" }, { input: "5\n3 1 4 -1 2", output: "1 2 3 4" },
      { input: "7\n5 3 7 2 4 6 8", output: "2 3 4 5 6 7 8" }, { input: "4\n1 -1 2 -1 3", output: "1 3 2" },
      { input: "6\n4 2 6 1 3 5", output: "1 2 3 4 5 6" }, { input: "2\n1 2", output: "2 1" },
      { input: "3\n2 1 3", output: "1 2 3" }, { input: "5\n1 -1 2 -1 3 -1 4", output: "1 4 3 2" },
      { input: "4\n3 2 4 1", output: "1 2 3 4" }, { input: "6\n6 2 8 0 4 7 9", output: "0 2 4 6 7 8 9" }
    ],
    tags: ["stack", "tree", "depth-first-search", "binary-tree"]
  },
  {
    title: "Same Tree",
    difficulty: "Easy",
    description: "Given the roots of two binary trees `p` and `q`, write a function to check if they are the same or not.",
    examples: [
      { input: "p = [1,2,3], q = [1,2,3]", output: "true", explanation: "Both trees are identical." }
    ],
    constraints: ["The number of nodes in both trees is in the range [0, 100]."],
    visibleTestCases: [
      { input: "3\n1 2 3\n3\n1 2 3", output: "true" },
      { input: "2\n1 2\n2\n1 -1 2", output: "false" }
    ],
    hiddenTestCases: [
      { input: "0\n\n0\n", output: "true" }, { input: "1\n1\n1\n1", output: "true" },
      { input: "1\n1\n1\n2", output: "false" }, { input: "0\n\n1\n1", output: "false" },
      { input: "3\n1 2 3\n3\n1 3 2", output: "false" }, { input: "2\n1 2\n2\n1 2", output: "true" },
      { input: "4\n1 2 3 4\n4\n1 2 3 4", output: "true" }, { input: "3\n1 -1 2\n3\n1 -1 2", output: "true" },
      { input: "5\n1 2 3 4 5\n4\n1 2 3 4", output: "false" }, { input: "2\n2 1\n2\n1 2", output: "false" }
    ],
    tags: ["tree", "depth-first-search", "binary-tree"]
  },
  {
    title: "Symmetric Tree",
    difficulty: "Easy",
    description: "Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).",
    examples: [
      { input: "root = [1,2,2,3,4,4,3]", output: "true", explanation: "The tree is symmetric." }
    ],
    constraints: ["The number of nodes in the tree is in the range [1, 1000]."],
    visibleTestCases: [
      { input: "7\n1 2 2 3 4 4 3", output: "true" },
      { input: "3\n1 2 2 -1 3 -1 3", output: "false" }
    ],
    hiddenTestCases: [
      { input: "1\n1", output: "true" }, { input: "3\n1 2 2", output: "true" },
      { input: "5\n1 2 2 3 -1 -1 3", output: "true" }, { input: "3\n1 2 3", output: "false" },
      { input: "7\n1 2 2 -1 3 3 -1", output: "true" }, { input: "5\n5 4 1 -1 1 -1 4", output: "false" },
      { input: "4\n1 2 2 2", output: "false" }, { input: "9\n1 2 2 3 4 4 3 5 6", output: "false" },
      { input: "5\n2 3 3 4 5 5 4", output: "true" }, { input: "6\n1 2 2 2 -1 -1 2", output: "false" }
    ],
    tags: ["tree", "depth-first-search", "breadth-first-search", "binary-tree"]
  },

  // Continue with MEDIUM problems (21-100)
  {
    title: "Add Two Numbers",
    difficulty: "Medium",
    description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order.",
    examples: [
      { input: "l1 = [2,4,3], l2 = [5,6,4]", output: "[7,0,8]", explanation: "342 + 465 = 807." }
    ],
    constraints: ["The number of nodes in each linked list is in the range [1, 100]."],
    visibleTestCases: [
      { input: "3\n2 4 3\n3\n5 6 4", output: "7 0 8" },
      { input: "1\n0\n1\n0", output: "0" },
      { input: "7\n9 9 9 9 9 9 9\n4\n9 9 9 9", output: "8 9 9 9 0 0 0 1" }
    ],
    hiddenTestCases: [
      { input: "2\n2 4\n2\n5 6", output: "7 0 1" }, { input: "1\n5\n1\n5", output: "0 1" },
      { input: "3\n1 0 0\n3\n0 0 1", output: "1 0 1" }, { input: "1\n1\n2\n9 9", output: "0 0 1" },
      { input: "4\n1 2 3 4\n2\n5 6", output: "6 8 3 4" }, { input: "3\n9 9 9\n1\n1", output: "0 0 0 1" },
      { input: "2\n8 7\n1\n5", output: "3 8" }, { input: "5\n1 2 3 4 5\n3\n6 7 8", output: "7 9 1 5 5" },
      { input: "1\n9\n1\n9", output: "8 1" }, { input: "4\n2 7 8 9\n4\n1 3 2 1", output: "3 0 1 1 1" },
      { input: "2\n9 8\n2\n1 2", output: "0 1 1" }, { input: "6\n1 0 0 0 0 1\n3\n5 6 4", output: "6 6 4 0 0 1" }
    ],
    tags: ["linked-list", "math", "recursion"]
  },
  {
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    description: "Given a string `s`, find the length of the longest substring without repeating characters.",
    examples: [
      { input: "s = \"abcabcbb\"", output: "3", explanation: "The answer is 'abc', with the length of 3." }
    ],
    constraints: ["0 <= s.length <= 5 * 10^4"],
    visibleTestCases: [
      { input: "abcabcbb", output: "3" },
      { input: "bbbbb", output: "1" },
      { input: "pwwkew", output: "3" }
    ],
    hiddenTestCases: [
      { input: "abcddefgh", output: "5" }, { input: "aab", output: "2" }, { input: "dvdf", output: "3" },
      { input: "anviaj", output: "5" }, { input: "nfpdmpi", output: "5" }, { input: "abcbdaac", output: "4" },
      { input: "a", output: "1" }, { input: "ab", output: "2" }, { input: "abcabcbbabc", output: "3" },
      { input: "", output: "0" }, { input: "tmmzuxt", output: "5" }, { input: "ohvhjdml", output: "6" },
      { input: "abcdef", output: "6" }, { input: "aabaab!bb", output: "3" }, { input: "pwwkew", output: "3" },
      { input: "cdd", output: "2" }, { input: "abba", output: "2" }, { input: "wobgrovw", output: "6" }
    ],
    tags: ["hash-table", "string", "sliding-window"]
  },
  {
    title: "Longest Palindromic Substring",
    difficulty: "Medium",
    description: "Given a string `s`, return the longest palindromic substring in `s`.",
    examples: [
      { input: "s = \"babad\"", output: "\"bab\"", explanation: "\"aba\" is also a valid answer." }
    ],
    constraints: ["1 <= s.length <= 1000"],
    visibleTestCases: [
      { input: "babad", output: "bab" },
      { input: "cbbd", output: "bb" }
    ],
    hiddenTestCases: [
      { input: "a", output: "a" }, { input: "ac", output: "a" }, { input: "bb", output: "bb" },
      { input: "ccc", output: "ccc" }, { input: "aba", output: "aba" }, { input: "abcba", output: "abcba" },
      { input: "racecar", output: "racecar" }, { input: "noon", output: "noon" }, { input: "level", output: "level" },
      { input: "abacabad", output: "abacaba" }, { input: "bananas", output: "anana" }, { input: "tattarrattat", output: "tattarrattat" },
      { input: "civilwartestingwhetherthatnaptionoranynartionsoconceivedandsodedicatedcanlongendure", output: "ranynar" },
      { input: "abcdeffedcba", output: "abcdeffedcba" }, { input: "forgeeksskeegfor", output: "geeksskeeg" }
    ],
    tags: ["string", "dynamic-programming"]
  },
  {
    title: "ZigZag Conversion",
    difficulty: "Medium",
    description: "The string \"PAYPALISHIRING\" is written in a zigzag pattern on a given number of rows.",
    examples: [
      { input: "s = \"PAYPALISHIRING\", numRows = 3", output: "\"PAHNAPLSIIGYIR\"", explanation: "Convert string to zigzag pattern." }
    ],
    constraints: ["1 <= s.length <= 1000"],
    visibleTestCases: [
      { input: "PAYPALISHIRING\n3", output: "PAHNAPLSIIGYIR" },
      { input: "PAYPALISHIRING\n4", output: "PINALSIGYAHRPI" },
      { input: "A\n1", output: "A" }
    ],
    hiddenTestCases: [
      { input: "AB\n1", output: "AB" }, { input: "ABC\n2", output: "ACB" }, { input: "ABCD\n2", output: "ACBD" },
      { input: "ABCDE\n3", output: "AEBDC" }, { input: "ABCDEF\n3", output: "AEBDFC" },
      { input: "HELLO\n2", output: "HLOEL" }, { input: "WORLD\n3", output: "WRDOL" },
      { input: "PROGRAMMING\n4", output: "PORMIAGRGNM" }, { input: "TESTING\n3", output: "TEGTSNI" },
      { input: "ABCDEFGHIJ\n4", output: "AGBFHCEIJDK" }, { input: "CONVERT\n3", output: "CVEONRT" },
      { input: "ZIGZAG\n2", output: "ZGAZIG" }, { input: "EXAMPLE\n5", output: "EAPLMXE" }
    ],
    tags: ["string"]
  },
  {
    title: "Reverse Integer",
    difficulty: "Medium",
    description: "Given a signed 32-bit integer `x`, return `x` with its digits reversed.",
    examples: [
      { input: "x = 123", output: "321", explanation: "Reverse the digits of 123." }
    ],
    constraints: ["-2^31 <= x <= 2^31 - 1"],
    visibleTestCases: [
      { input: "123", output: "321" },
      { input: "-123", output: "-321" },
      { input: "120", output: "21" }
    ],
    hiddenTestCases: [
      { input: "0", output: "0" }, { input: "1", output: "1" }, { input: "-1", output: "-1" },
      { input: "10", output: "1" }, { input: "100", output: "1" }, { input: "1000", output: "1" },
      { input: "1534236469", output: "0" }, { input: "-2147483648", output: "0" }, { input: "2147483647", output: "0" },
      { input: "1234", output: "4321" }, { input: "-1234", output: "-4321" }, { input: "54321", output: "12345" },
      { input: "-54321", output: "-12345" }, { input: "900000", output: "9" }, { input: "-900000", output: "-9" },
      { input: "7463847412", output: "2147483647" }, { input: "-8463847412", output: "-2147483648" }
    ],
    tags: ["math"]
  },
  {
    title: "Container With Most Water",
    difficulty: "Medium",
    description: "You are given an integer array `height` of length `n`. Find two lines that together with the x-axis form a container that contains the most water.",
    examples: [
      { input: "height = [1,8,6,2,5,4,8,3,7]", output: "49", explanation: "The maximum area is 49." }
    ],
    constraints: ["n >= 2"],
    visibleTestCases: [
      { input: "9\n1 8 6 2 5 4 8 3 7", output: "49" },
      { input: "2\n1 1", output: "1" }
    ],
    hiddenTestCases: [
      { input: "2\n2 1", output: "1" }, { input: "3\n1 2 1", output: "2" }, { input: "4\n1 2 4 3", output: "4" },
      { input: "5\n2 3 4 5 18", output: "17" }, { input: "6\n1 2 3 4 5 6", output: "9" },
      { input: "7\n6 5 4 3 2 1 0", output: "12" }, { input: "8\n1 3 2 5 25 24 5 8", output: "24" },
      { input: "10\n1 8 6 2 5 4 8 25 7 5", output: "49" }, { input: "3\n3 9 3", output: "6" },
      { input: "4\n1 1 1 1", output: "3" }, { input: "5\n5 4 3 2 1", output: "6" },
      { input: "6\n2 1 2 3 2 1", output: "8" }, { input: "7\n1 2 3 4 3 2 1", output: "9" }
    ],
    tags: ["array", "two-pointers", "greedy"]
  },
  {
    title: "Integer to Roman",
    difficulty: "Medium",
    description: "Given an integer, convert it to a roman numeral.",
    examples: [
      { input: "num = 3", output: "\"III\"", explanation: "3 is represented as III in roman." }
    ],
    constraints: ["1 <= num <= 3999"],
    visibleTestCases: [
      { input: "3", output: "III" },
      { input: "58", output: "LVIII" },
      { input: "1994", output: "MCMXCIV" }
    ],
    hiddenTestCases: [
      { input: "1", output: "I" }, { input: "2", output: "II" }, { input: "4", output: "IV" },
      { input: "5", output: "V" }, { input: "9", output: "IX" }, { input: "10", output: "X" },
      { input: "27", output: "XXVII" }, { input: "40", output: "XL" }, { input: "90", output: "XC" },
      { input: "400", output: "CD" }, { input: "500", output: "D" }, { input: "900", output: "CM" },
      { input: "1000", output: "M" }, { input: "1444", output: "MCDXLIV" }, { input: "1954", output: "MCMLIV" },
      { input: "2014", output: "MMXIV" }, { input: "3999", output: "MMMCMXCIX" }
    ],
    tags: ["hash-table", "math", "string"]
  },
  {
    title: "3Sum",
    difficulty: "Medium",
    description: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
    examples: [
      { input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]", explanation: "The distinct triplets are [-1,0,1] and [-1,-1,2]." }
    ],
    constraints: ["3 <= nums.length <= 3000"],
    visibleTestCases: [
      { input: "6\n-1 0 1 2 -1 -4", output: "-1 -1 2\n-1 0 1" },
      { input: "3\n0 1 1", output: "" },
      { input: "3\n0 0 0", output: "0 0 0" }
    ],
    hiddenTestCases: [
      { input: "4\n-2 0 1 1", output: "" }, { input: "5\n-1 0 1 0 1", output: "-1 0 1" },
      { input: "6\n-2 0 0 2 2 2", output: "-2 0 2" }, { input: "7\n-4 -2 -1 0 1 2 4", output: "-4 0 4\n-2 -1 3\n-2 0 2\n-1 0 1" },
      { input: "8\n-1 0 1 2 -1 -4 -2 -3", output: "-4 1 3\n-4 2 2\n-3 1 2\n-2 0 2\n-2 1 1\n-1 -1 2\n-1 0 1" },
      { input: "5\n1 -1 -1 0 1", output: "-1 0 1" }, { input: "6\n3 0 -2 -1 1 2", output: "-2 0 2\n-2 1 1\n-1 0 1" },
      { input: "4\n1 2 -2 -1", output: "" }, { input: "9\n-1 0 1 2 -1 -4 -2 -3 3", output: "-4 1 3\n-3 0 3\n-3 1 2\n-2 -1 3\n-2 0 2\n-1 -1 2\n-1 0 1" },
      { input: "7\n0 0 0 0 0 0 0", output: "0 0 0" }
    ],
    tags: ["array", "two-pointers", "sorting"]
  },
  {
    title: "3Sum Closest",
    difficulty: "Medium",
    description: "Given an integer array `nums` of length n and an integer `target`, find three integers in `nums` such that the sum is closest to `target`.",
    examples: [
      { input: "nums = [-1,2,1,-4], target = 1", output: "2", explanation: "The sum that is closest to the target is 2. (-1 + 2 + 1 = 2)." }
    ],
    constraints: ["3 <= nums.length <= 1000"],
    visibleTestCases: [
      { input: "4\n-1 2 1 -4\n1", output: "2" },
      { input: "3\n0 0 0\n1", output: "0" }
    ],
    hiddenTestCases: [
      { input: "4\n1 1 1 0\n-100", output: "2" }, { input: "5\n1 1 -1 -1 3\n3", output: "3" },
      { input: "6\n-1 2 1 -4 5 3\n4", output: "4" }, { input: "4\n0 2 1 -3\n1", output: "0" },
      { input: "5\n1 1 1 1 1\n3", output: "3" }, { input: "7\n-3 -2 -5 3 -4 1 2\n-1", output: "-2" },
      { input: "6\n4 0 5 -5 3 3\n3", output: "2" }, { input: "8\n-1 0 1 1 55 -3 2 4\n0", output: "0" },
      { input: "5\n1 2 3 4 5\n10", output: "12" }, { input: "4\n-5 -1 1 2\n0", output: "0" },
      { input: "6\n0 1 2 3 4 5\n7", output: "7" }, { input: "5\n-2 0 1 1 2\n0", output: "0" }
    ],
    tags: ["array", "two-pointers", "sorting"]
  },
  {
    title: "Letter Combinations of a Phone Number",
    difficulty: "Medium",
    description: "Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent.",
    examples: [
      { input: "digits = \"23\"", output: "[\"ad\", \"ae\", \"af\", \"bd\", \"be\", \"bf\", \"cd\", \"ce\", \"cf\"]", explanation: "All combinations for digits 23." }
    ],
    constraints: ["0 <= digits.length <= 4"],
    visibleTestCases: [
      { input: "23", output: "ad ae af bd be bf cd ce cf" },
      { input: "", output: "" },
      { input: "2", output: "a b c" }
    ],
    hiddenTestCases: [
      { input: "3", output: "d e f" }, { input: "4", output: "g h i" }, { input: "5", output: "j k l" },
      { input: "6", output: "m n o" }, { input: "7", output: "p q r s" }, { input: "8", output: "t u v" },
      { input: "9", output: "w x y z" }, { input: "22", output: "aa ab ac ba bb bc ca cb cc" },
      { input: "234", output: "adg adh adi aeg aeh aei afg afh afi bdg bdh bdi beg beh bei bfg bfh bfi cdg cdh cdi ceg ceh cei cfg cfh cfi" },
      { input: "77", output: "pp pq pr ps qp qq qr qs rp rq rr rs sp sq sr ss" },
      { input: "789", output: "ptw ptx pty ptz puw pux puy puz pvw pvx pvy pvz qtw qtx qty qtz quw qux quy quz qvw qvx qvy qvz rtw rtx rty rtz ruw rux ruy ruz rvw rvx rvy rvz stw stx sty stz suw sux suy suz svw svx svy svz" }
    ],
    tags: ["hash-table", "string", "backtracking"]
  },
  {
    title: "4Sum",
    difficulty: "Medium",
    description: "Given an array `nums` of n integers, return an array of all the unique quadruplets [nums[a], nums[b], nums[c], nums[d]] such that nums[a] + nums[b] + nums[c] + nums[d] == target.",
    examples: [
      { input: "nums = [1,0,-1,0,-2,2], target = 0", output: "[[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]", explanation: "Find quadruplets that sum to target." }
    ],
    constraints: ["1 <= nums.length <= 200"],
    visibleTestCases: [
      { input: "6\n1 0 -1 0 -2 2\n0", output: "-2 -1 1 2\n-2 0 0 2\n-1 0 0 1" },
      { input: "5\n2 2 2 2 2\n8", output: "2 2 2 2" }
    ],
    hiddenTestCases: [
      { input: "4\n1 2 3 4\n10", output: "1 2 3 4" }, { input: "7\n-3 -2 -1 0 0 1 2\n0", output: "-3 -2 2 3\n-3 -1 1 3\n-3 0 1 2\n-2 -1 0 3\n-2 -1 1 2\n-2 0 0 2\n-1 0 0 1" },
      { input: "8\n-5 -4 -3 -2 -1 0 1 2\n-2", output: "-5 -4 3 4\n-5 -3 2 4\n-5 -2 1 4\n-5 -1 0 4\n-4 -3 1 4\n-4 -2 0 4\n-3 -2 -1 4" },
      { input: "6\n0 0 0 0 0 0\n0", output: "0 0 0 0" }, { input: "4\n-1 0 1 2\n2", output: "-1 0 1 2" },
      { input: "5\n1 -2 -5 -4 -3\n3", output: "" }, { input: "9\n-2 -1 -1 1 1 2 2 3 3\n4", output: "-2 -1 3 4\n-2 1 2 3\n-1 -1 2 4\n-1 1 1 3" },
      { input: "10\n4 3 3 4 4 2 1 2 1 1\n9", output: "1 1 3 4\n1 2 2 4\n1 2 3 3" }
    ],
    tags: ["array", "two-pointers", "sorting"]
  },

  // Continue with more Medium problems
  {
    title: "Remove Nth Node From End of List",
    difficulty: "Medium",
    description: "Given the head of a linked list, remove the nth node from the end of the list and return its head.",
    examples: [
      { input: "head = [1,2,3,4,5], n = 2", output: "[1,2,3,5]", explanation: "Remove the 2nd node from the end." }
    ],
    constraints: ["The number of nodes in the list is sz.", "1 <= sz <= 30"],
    visibleTestCases: [
      { input: "5\n1 2 3 4 5\n2", output: "1 2 3 5" },
      { input: "1\n1\n1", output: "" },
      { input: "2\n1 2\n1", output: "1" }
    ],
    hiddenTestCases: [
      { input: "3\n1 2 3\n3", output: "2 3" }, { input: "4\n1 2 3 4\n1", output: "1 2 3" },
      { input: "5\n1 2 3 4 5\n5", output: "2 3 4 5" }, { input: "6\n1 2 3 4 5 6\n3", output: "1 2 3 5 6" },
      { input: "2\n1 2\n2", output: "2" }, { input: "3\n1 2 3\n1", output: "1 2" },
      { input: "4\n1 2 3 4\n4", output: "2 3 4" }, { input: "7\n1 2 3 4 5 6 7\n4", output: "1 2 3 5 6 7" },
      { input: "8\n1 2 3 4 5 6 7 8\n1", output: "1 2 3 4 5 6 7" }, { input: "3\n1 2 3\n2", output: "1 3" },
      { input: "10\n1 2 3 4 5 6 7 8 9 10\n5", output: "1 2 3 4 5 7 8 9 10" }
    ],
    tags: ["linked-list", "two-pointers"]
  },
  {
    title: "Valid Sudoku",
    difficulty: "Medium",
    description: "Determine if a 9 x 9 Sudoku board is valid. Only the filled cells need to be validated according to the following rules.",
    examples: [
      { input: "board with valid configuration", output: "true", explanation: "The Sudoku board is valid." }
    ],
    constraints: ["board.length == 9", "board[i].length == 9"],
    visibleTestCases: [
      { input: "53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79", output: "true" },
      { input: "53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..78", output: "false" }
    ],
    hiddenTestCases: [
      { input: "123456789456789123789123456234567891567891234891234567345678912678912345912345678", output: "true" },
      { input: "123456789456789123789123456234567891567891234891234567345678912678912345912345679", output: "false" },
      { input: "5........6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79", output: "true" },
      { input: "5........6..195....98....6.8...6...34..8.5..17...2...6.6....28....419..5....8..79", output: "false" },
      { input: "..........................................................................", output: "true" },
      { input: "1.........................................................................", output: "true" },
      { input: "12........................................................................", output: "false" },
      { input: "1........2........................................................................", output: "false" },
      { input: "987654321654321987321987654876543219543219876219876543198765432765432198432198765", output: "true" },
      { input: "987654321654321987321987654876543219543219876219876543198765432765432198432198766", output: "false" }
    ],
    tags: ["array", "hash-table", "matrix"]
  },
  {
    title: "Count and Say",
    difficulty: "Medium",
    description: "The count-and-say sequence is a sequence of digit strings defined by the recursive formula.",
    examples: [
      { input: "n = 1", output: "\"1\"", explanation: "This is the base case." }
    ],
    constraints: ["1 <= n <= 30"],
    visibleTestCases: [
      { input: "1", output: "1" },
      { input: "4", output: "1211" }
    ],
    hiddenTestCases: [
      { input: "2", output: "11" }, { input: "3", output: "21" }, { input: "5", output: "111221" },
      { input: "6", output: "312211" }, { input: "7", output: "13112221" }, { input: "8", output: "1113213211" },
      { input: "9", output: "31131211131221" }, { input: "10", output: "13211311123113112211" },
      { input: "11", output: "11131221133112132113212221" }, { input: "12", output: "3113112221232112111312211312113211" },
      { input: "13", output: "1321132132111213122112311311222113111221131221" },
      { input: "14", output: "11131221131211131231121113112221121321132132211331222113112211" },
      { input: "15", output: "311311222113111231131112132112311321322112111312211312111322212311322113212221" }
    ],
    tags: ["string"]
  },
  {
    title: "Combination Sum",
    difficulty: "Medium",
    description: "Given an array of distinct integers `candidates` and a target integer `target`, return a list of all unique combinations of `candidates` where the chosen numbers sum to `target`.",
    examples: [
      { input: "candidates = [2,3,6,7], target = 7", output: "[[2,2,3],[7]]", explanation: "2 and 3 are candidates, and 2 + 2 + 3 = 7. 7 is a candidate, and 7 = 7." }
    ],
    constraints: ["1 <= candidates.length <= 30"],
    visibleTestCases: [
      { input: "4\n2 3 6 7\n7", output: "2 2 3\n7" },
      { input: "3\n2 3 5\n8", output: "2 2 2 2\n2 3 3\n3 5" },
      { input: "1\n2\n1", output: "" }
    ],
    hiddenTestCases: [
      { input: "2\n2 3\n5", output: "2 3" }, { input: "3\n1 2 3\n4", output: "1 1 1 1\n1 1 2\n1 3\n2 2" },
      { input: "4\n1 2 3 4\n6", output: "1 1 1 1 1 1\n1 1 1 3\n1 1 2 2\n1 1 4\n1 2 3\n2 2 2\n2 4\n3 3\n6" },
      { input: "5\n2 4 6 8 10\n12", output: "2 2 2 2 2 2\n2 2 2 6\n2 2 8\n2 4 6\n2 10\n4 4 4\n4 8\n6 6\n12" },
      { input: "3\n3 5 7\n10", output: "3 7\n5 5" }, { input: "4\n1 3 5 7\n9", output: "1 1 7\n1 1 1 1 5\n1 1 1 3 3\n1 3 5\n3 3 3\n9" },
      { input: "2\n5 10\n15", output: "5 10\n15" }, { input: "6\n2 3 5 7 11 13\n13", output: "2 11\n13" },
      { input: "3\n4 9 14\n18", output: "4 14\n9 9\n18" }
    ],
    tags: ["array", "backtracking"]
  },
  {
    title: "Combination Sum II",
    difficulty: "Medium",
    description: "Given a collection of candidate numbers (candidates) and a target number (target), find all unique combinations in candidates where the candidate numbers sum to target.",
    examples: [
      { input: "candidates = [10,1,2,7,6,1,5], target = 8", output: "[[1,1,6],[1,2,5],[1,7],[2,6]]", explanation: "These are the unique combinations that sum to 8." }
    ],
    constraints: ["1 <= candidates.length <= 100"],
    visibleTestCases: [
      { input: "7\n10 1 2 7 6 1 5\n8", output: "1 1 6\n1 2 5\n1 7\n2 6" },
      { input: "5\n2 5 2 1 2\n5", output: "1 2 2\n5" }
    ],
    hiddenTestCases: [
      { input: "3\n1 1 2\n3", output: "1 2" }, { input: "4\n1 2 2 3\n4", output: "1 3\n2 2" },
      { input: "6\n4 4 2 1 4 2\n6", output: "1 1 4\n2 4" }, { input: "5\n3 1 3 5 1\n6", output: "1 5\n3 3" },
      { input: "7\n1 1 1 2 2 3 3\n6", output: "1 1 1 3\n1 2 3\n2 2 2\n3 3" },
      { input: "4\n5 5 5 5\n10", output: "5 5" }, { input: "8\n1 2 3 4 5 6 7 8\n10", output: "1 2 7\n1 3 6\n1 4 5\n2 3 5\n2 8\n3 7\n4 6" },
      { input: "6\n2 2 2 2 2 2\n6", output: "2 2 2" }, { input: "5\n1 3 3 3 5\n8", output: "3 5" },
      { input: "9\n1 1 2 2 3 3 4 4 5\n8", output: "1 1 2 4\n1 2 2 3\n1 3 4\n2 2 4\n3 5" }
    ],
    tags: ["array", "backtracking"]
  },
  {
    title: "First Missing Positive",
    difficulty: "Hard",
    description: "Given an unsorted integer array `nums`, return the smallest missing positive integer.",
    examples: [
      { input: "nums = [1,2,0]", output: "3", explanation: "The numbers 1-2 are present, so the smallest missing positive is 3." }
    ],
    constraints: ["1 <= nums.length <= 10^5"],
    visibleTestCases: [
      { input: "3\n1 2 0", output: "3" },
      { input: "4\n3 4 -1 1", output: "2" },
      { input: "5\n7 8 9 11 12", output: "1" }
    ],
    hiddenTestCases: [
      { input: "1\n1", output: "2" }, { input: "1\n2", output: "1" }, { input: "2\n1 2", output: "3" },
      { input: "4\n1 3 4 5", output: "2" }, { input: "5\n2 3 4 5 6", output: "1" },
      { input: "6\n1 2 3 4 5 6", output: "7" }, { input: "3\n-1 -2 -3", output: "1" },
      { input: "7\n1 1000000 2 3 4 5 6", output: "7" }, { input: "4\n0 -1 3 1", output: "2" },
      { input: "8\n1 2 6 3 5 4 7 8", output: "9" }, { input: "10\n41 34 15 12 9 0 -6 -50 -61 67", output: "1" },
      { input: "6\n2 1 4 3 6 5", output: "7" }, { input: "5\n1 1 1 1 1", output: "2" }
    ],
    tags: ["array", "hash-table"]
  },
  {
    title: "Trapping Rain Water",
    difficulty: "Hard",
    description: "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    examples: [
      { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6", explanation: "The elevation map can trap 6 units of rain water." }
    ],
    constraints: ["n == height.length"],
    visibleTestCases: [
      { input: "12\n0 1 0 2 1 0 1 3 2 1 2 1", output: "6" },
      { input: "6\n4 2 0 3 2 5", output: "9" }
    ],
    hiddenTestCases: [
      { input: "1\n5", output: "0" }, { input: "2\n1 2", output: "0" }, { input: "3\n3 0 2", output: "2" },
      { input: "4\n0 2 0 4", output: "2" }, { input: "5\n5 4 1 2 3", output: "1" },
      { input: "6\n2 1 2 1 0 1", output: "3" }, { input: "7\n3 0 0 2 0 4 0", output: "10" },
      { input: "8\n0 7 1 4 6 2 0 5", output: "23" }, { input: "4\n1 0 0 1", output: "2" },
      { input: "9\n6 4 2 0 3 2 0 3 1", output: "4" }, { input: "10\n0 1 2 0 3 0 1 2 0 1", output: "8" },
      { input: "5\n2 0 2 0 2", output: "4" }, { input: "3\n0 0 0", output: "0" }
    ],
    tags: ["array", "two-pointers", "dynamic-programming", "stack", "monotonic-stack"]
  },
  {
    title: "Multiply Strings",
    difficulty: "Medium",
    description: "Given two non-negative integers `num1` and `num2` represented as strings, return the product of `num1` and `num2`, also represented as a string.",
    examples: [
      { input: "num1 = \"2\", num2 = \"3\"", output: "\"6\"", explanation: "2 * 3 = 6." }
    ],
    constraints: ["1 <= num1.length, num2.length <= 200"],
    visibleTestCases: [
      { input: "2\n3", output: "6" },
      { input: "123\n456", output: "56088" }
    ],
    hiddenTestCases: [
      { input: "0\n0", output: "0" }, { input: "1\n1", output: "1" }, { input: "9\n9", output: "81" },
      { input: "12\n34", output: "408" }, { input: "99\n99", output: "9801" },
      { input: "123\n0", output: "0" }, { input: "999\n999", output: "998001" },
      { input: "1234\n5678", output: "7006652" }, { input: "9999\n9999", output: "99980001" },
      { input: "12345\n67890", output: "838102050" }, { input: "11\n11", output: "121" },
      { input: "100\n100", output: "10000" }, { input: "987\n654", output: "645498" }
    ],
    tags: ["math", "string", "simulation"]
  },
  {
    title: "Wildcard Matching",
    difficulty: "Hard",
    description: "Given an input string (`s`) and a pattern (`p`), implement wildcard pattern matching with support for `'?'` and `'*'`.",
    examples: [
      { input: "s = \"aa\", p = \"a\"", output: "false", explanation: "\"a\" does not match the entire string \"aa\"." }
    ],
    constraints: ["0 <= s.length, p.length <= 2000"],
    visibleTestCases: [
      { input: "aa\na", output: "false" },
      { input: "aa\n*", output: "true" },
      { input: "cb\n?a", output: "false" }
    ],
    hiddenTestCases: [
      { input: "adceb\n*a*b*", output: "true" }, { input: "acdcb\na*c?b", output: "false" },
      { input: "abcdef\na*f", output: "true" }, { input: "abc\n*", output: "true" },
      { input: "a\na", output: "true" }, { input: "ab\n?*", output: "true" },
      { input: "mississippi\nm??*ss*?i*pi", output: "false" }, { input: "ho\n**ho", output: "true" },
      { input: "abcabczzzde\n*abc???de*", output: "true" }, { input: "aa\n*", output: "true" },
      { input: "c\n*?*", output: "true" }, { input: "abcd\n*", output: "true" },
      { input: "leetcode\n*e*t?d*", output: "false" }
    ],
    tags: ["string", "dynamic-programming", "greedy", "recursion"]
  },
  {
    title: "Jump Game",
    difficulty: "Medium",
    description: "You are given an integer array `nums`. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position.",
    examples: [
      { input: "nums = [2,3,1,1,4]", output: "true", explanation: "Jump 1 step from index 0 to 1, then 3 steps to the last index." }
    ],
    constraints: ["1 <= nums.length <= 10^4"],
    visibleTestCases: [
      { input: "5\n2 3 1 1 4", output: "true" },
      { input: "5\n3 2 1 0 4", output: "false" }
    ],
    hiddenTestCases: [
      { input: "1\n0", output: "true" }, { input: "2\n1 0", output: "true" }, { input: "2\n0 1", output: "false" },
      { input: "3\n2 0 0", output: "true" }, { input: "4\n1 1 1 1", output: "true" },
      { input: "6\n3 0 8 2 0 0", output: "true" }, { input: "5\n2 0 6 9 8", output: "true" },
      { input: "4\n1 0 1 0", output: "false" }, { input: "3\n1 2 3", output: "true" },
      { input: "7\n5 9 3 2 1 0 2", output: "true" }, { input: "8\n2 5 0 0 4 0 0 0", output: "true" },
      { input: "6\n1 1 0 1 1 1", output: "false" }, { input: "4\n4 0 0 0", output: "true" }
    ],
    tags: ["array", "dynamic-programming", "greedy"]
  },
  {
    title: "Jump Game II",
    difficulty: "Medium",
    description: "Given an array of non-negative integers `nums`, you are initially positioned at the first index of the array. Your goal is to reach the last index in the minimum number of jumps.",
    examples: [
      { input: "nums = [2,3,1,1,4]", output: "2", explanation: "The minimum number of jumps to reach the last index is 2." }
    ],
    constraints: ["1 <= nums.length <= 10^4"],
    visibleTestCases: [
      { input: "5\n2 3 1 1 4", output: "2" },
      { input: "4\n2 3 0 1", output: "2" }
    ],
    hiddenTestCases: [
      { input: "1\n0", output: "0" }, { input: "2\n1 2", output: "1" }, { input: "3\n2 1 3", output: "1" },
      { input: "4\n1 1 1 1", output: "3" }, { input: "5\n4 1 1 1 1", output: "1" },
      { input: "6\n1 2 3 4 5 6", output: "3" }, { input: "7\n5 6 4 4 6 9 4", output: "2" },
      { input: "8\n7 0 9 6 9 6 1 7", output: "1" }, { input: "3\n1 2 1", output: "2" },
      { input: "9\n2 3 1 2 4 2 3 1 4", output: "4" }, { input: "10\n1 1 1 1 1 1 1 1 1 1", output: "9" },
      { input: "6\n10 9 8 7 6 5", output: "1" }, { input: "5\n3 4 3 2 5", output: "2" }
    ],
    tags: ["array", "dynamic-programming", "greedy"]
  },

  // HARD PROBLEMS (101-150)
  {
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    description: "Given two sorted arrays `nums1` and `nums2`, return the median of the two sorted arrays.",
    examples: [
      { input: "nums1 = [1,3], nums2 = [2]", output: "2.00000", explanation: "Merged array = [1,2,3] and median is 2." }
    ],
    constraints: ["0 <= m <= 1000"],
    visibleTestCases: [
      { input: "2\n1 2\n2\n3 4", output: "2.5" },
      { input: "2\n0 0\n2\n0 0", output: "0.0" },
      { input: "0\n\n1\n1", output: "1.0" }
    ],
    hiddenTestCases: [
      { input: "1\n1\n3\n2 3 4", output: "2.5" }, { input: "3\n1 2 5\n2\n3 4", output: "3.0" },
      { input: "3\n5 6 7\n4\n1 2 3 4", output: "4.0" }, { input: "1\n100\n1\n200", output: "150.0" },
      { input: "2\n1 2\n0\n", output: "1.5" }, { input: "1\n3\n2\n-2 -1", output: "-1.0" },
      { input: "1\n1\n4\n2 3 4 5", output: "3.0" }, { input: "2\n1 1\n2\n1 1", output: "1.0" },
      { input: "2\n1 3\n2\n2 7", output: "2.5" }, { input: "1\n2\n1\n1", output: "1.5" },
      { input: "4\n1 3 5 7\n3\n2 4 6", output: "4.0" }, { input: "0\n\n5\n1 2 3 4 5", output: "3.0" },
      { input: "5\n1 2 3 4 5\n0\n", output: "3.0" }, { input: "3\n-5 -2 1\n4\n-3 0 2 8", output: "0.0" }
    ],
    tags: ["array", "binary-search", "divide-and-conquer"]
  },
  {
    title: "Regular Expression Matching",
    difficulty: "Hard",
    description: "Given an input string `s` and a pattern `p`, implement regular expression matching with support for `'.'` and `'*'`.",
    examples: [
      { input: "s = \"aa\", p = \"a\"", output: "false", explanation: "\"a\" does not match the entire string \"aa\"." }
    ],
    constraints: ["1 <= s.length <= 20"],
    visibleTestCases: [
      { input: "aa\na", output: "false" },
      { input: "aa\na*", output: "true" },
      { input: "ab\n.*", output: "true" }
    ],
    hiddenTestCases: [
      { input: "aab\nc*a*b", output: "true" }, { input: "mississippi\nmis*is*p*.", output: "false" },
      { input: "ab\n.*c", output: "false" }, { input: "aaa\na*a", output: "true" },
      { input: "aaa\nab*a*c*a", output: "true" }, { input: "a\nab*", output: "true" },
      { input: "bbbba\n.*a*a", output: "true" }, { input: "abcd\nd*", output: "false" },
      { input: "aaca\nab*a*c*a", output: "true" }, { input: "aaa\na.a", output: "true" },
      { input: "ab\n.*", output: "true" }, { input: "a\na*", output: "true" },
      { input: "ab\n.*ab", output: "true" }, { input: "aaa\naaaa", output: "false" }
    ],
    tags: ["string", "dynamic-programming", "recursion"]
  },
  {
    title: "Merge k Sorted Lists",
    difficulty: "Hard",
    description: "You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    examples: [
      { input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]", explanation: "Merge all k sorted lists." }
    ],
    constraints: ["k == lists.length"],
    visibleTestCases: [
      { input: "3\n3\n1 4 5\n3\n1 3 4\n2\n2 6", output: "1 1 2 3 4 4 5 6" },
      { input: "0", output: "" },
      { input: "1\n0", output: "" }
    ],
    hiddenTestCases: [
      { input: "1\n1\n1", output: "1" }, { input: "2\n2\n1 2\n2\n3 4", output: "1 2 3 4" },
      { input: "4\n1\n1\n1\n2\n1\n3\n1\n4", output: "1 2 3 4" },
      { input: "2\n3\n1 2 3\n0", output: "1 2 3" }, { input: "3\n0\n1\n5\n2\n1 4", output: "1 4 5" },
      { input: "5\n2\n1 5\n2\n2 4\n2\n3 6\n1\n7\n1\n8", output: "1 2 3 4 5 6 7 8" },
      { input: "2\n4\n-1 1 2 3\n3\n0 4 5", output: "-1 0 1 2 3 4 5" },
      { input: "3\n1\n-2\n2\n-1 0\n1\n1", output: "-2 -1 0 1" },
      { input: "4\n2\n1 3\n2\n2 4\n2\n5 7\n2\n6 8", output: "1 2 3 4 5 6 7 8" }
    ],
    tags: ["linked-list", "divide-and-conquer", "heap-priority-queue", "merge-sort"]
  },
  {
    title: "Reverse Nodes in k-Group",
    difficulty: "Hard",
    description: "Given the head of a linked list, reverse the nodes of the list k at a time, and return the modified list.",
    examples: [
      { input: "head = [1,2,3,4,5], k = 2", output: "[2,1,4,3,5]", explanation: "Reverse every 2 nodes." }
    ],
    constraints: ["The number of nodes in the list is n.", "1 <= k <= n <= 5000"],
    visibleTestCases: [
      { input: "5\n1 2 3 4 5\n2", output: "2 1 4 3 5" },
      { input: "5\n1 2 3 4 5\n3", output: "3 2 1 4 5" }
    ],
    hiddenTestCases: [
      { input: "1\n1\n1", output: "1" }, { input: "2\n1 2\n1", output: "1 2" },
      { input: "3\n1 2 3\n2", output: "2 1 3" }, { input: "4\n1 2 3 4\n2", output: "2 1 4 3" },
      { input: "6\n1 2 3 4 5 6\n3", output: "3 2 1 6 5 4" }, { input: "7\n1 2 3 4 5 6 7\n3", output: "3 2 1 6 5 4 7" },
      { input: "8\n1 2 3 4 5 6 7 8\n4", output: "4 3 2 1 8 7 6 5" }, { input: "5\n1 2 3 4 5\n5", output: "5 4 3 2 1" },
      { input: "9\n1 2 3 4 5 6 7 8 9\n3", output: "3 2 1 6 5 4 9 8 7" }, { input: "10\n1 2 3 4 5 6 7 8 9 10\n4", output: "4 3 2 1 8 7 6 5 9 10" },
      { input: "6\n1 2 3 4 5 6\n2", output: "2 1 4 3 6 5" }, { input: "4\n1 2 3 4\n4", output: "4 3 2 1" }
    ],
    tags: ["linked-list", "recursion"]
  },
  {
    title: "Substring with Concatenation of All Words",
    difficulty: "Hard", 
    description: "You are given a string `s` and an array of strings `words` of the same length. Return all starting indices of substring(s) in `s` that is a concatenation of each word in `words` exactly once.",
    examples: [
      { input: "s = \"barfoothefoobarman\", words = [\"foo\",\"bar\"]", output: "[0,9]", explanation: "Substrings starting at index 0 and 9 are \"barfoo\" and \"foobar\" respectively." }
    ],
    constraints: ["1 <= s.length <= 10^4", "words[i].length == words[0].length"],
    visibleTestCases: [
      { input: "barfoothefoobarman\n2\nfoo\nbar", output: "0 9" },
      { input: "wordgoodgoodgoodbestword\n4\nword\ngood\nbest\nword", output: "" },
      { input: "barfoobar\n2\nfoo\nbar", output: "3" }
    ],
    hiddenTestCases: [
      { input: "lingmindraboofooowingdingbarrwingmonkeypoundcake\n4\nfooo\nbarr\nwing\nding", output: "13" },
      { input: "goodgoodbestword\n4\nword\ngood\nbest\ngood", output: "8" },
      { input: "ababab\n2\nab\nab", output: "0 2" }, { input: "abababab\n2\nab\nab", output: "0 2 4" },
      { input: "aaa\n2\naa\naa", output: "" }, { input: "aaaa\n2\naa\naa", output: "0" },
      { input: "abab\n2\nab\nab", output: "0" }, { input: "ababababa\n3\naba\naba\naba", output: "" },
      { input: "wordgoodgoodgoodbestword\n4\nword\ngood\nbest\nword", output: "" },
      { input: "barfoobar\n2\nbar\nfoo", output: "0 6" }, { input: "lingmindraboofooowingdingbarrwingmonkeypoundcake\n4\nfooo\nbarr\nwing\nding", output: "13" }
    ],
    tags: ["hash-table", "string", "sliding-window"]
  },
  {
    title: "Longest Valid Parentheses",
    difficulty: "Hard",
    description: "Given a string containing just the characters '(' and ')', find the length of the longest valid (well-formed) parentheses substring.",
    examples: [
      { input: "s = \"(()\"", output: "2", explanation: "The longest valid parentheses substring is \"()\"." }
    ],
    constraints: ["0 <= s.length <= 3 * 10^4"],
    visibleTestCases: [
      { input: "(()", output: "2" },
      { input: ")()())", output: "4" },
      { input: "", output: "0" }
    ],
    hiddenTestCases: [
      { input: "(", output: "0" }, { input: ")", output: "0" }, { input: "()", output: "2" },
      { input: "((", output: "0" }, { input: "))", output: "0" }, { input: "(()", output: "2" },
      { input: "())", output: "2" }, { input: "()()", output: "4" }, { input: "((()))", output: "6" },
      { input: "()(()", output: "2" }, { input: "(()())", output: "6" }, { input: ")()())", output: "4" },
      { input: "(()()", output: "4" }, { input: "()())", output: "4" }, { input: "(()(()", output: "2" },
      { input: "((())())", output: "8" }, { input: ")()()()(()", output: "6" }
    ],
    tags: ["string", "dynamic-programming", "stack"]
  },
  {
    title: "Search in Rotated Sorted Array",
    difficulty: "Medium",
    description: "There is an integer array `nums` sorted in ascending order (with distinct values). Prior to being passed to your function, `nums` is possibly rotated at an unknown pivot index `k`.",
    examples: [
      { input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4", explanation: "Target 0 is at index 4." }
    ],
    constraints: ["1 <= nums.length <= 5000"],
    visibleTestCases: [
      { input: "7\n4 5 6 7 0 1 2\n0", output: "4" },
      { input: "7\n4 5 6 7 0 1 2\n3", output: "-1" },
      { input: "1\n1\n0", output: "-1" }
    ],
    hiddenTestCases: [
      { input: "1\n1\n1", output: "0" }, { input: "2\n1 3\n3", output: "1" },
      { input: "5\n4 5 6 7 0\n4", output: "0" }, { input: "6\n6 7 0 1 2 4\n6", output: "0" },
      { input: "3\n3 1 2\n1", output: "1" }, { input: "4\n2 3 4 1\n1", output: "3" },
      { input: "8\n8 9 2 3 4 5 6 7\n2", output: "2" }, { input: "5\n5 1 2 3 4\n1", output: "1" },
      { input: "6\n4 5 6 1 2 3\n2", output: "4" }, { input: "7\n7 0 1 2 4 5 6\n5", output: "5" },
      { input: "4\n3 4 5 1\n4", output: "1" }, { input: "9\n9 0 1 2 3 4 5 6 7\n7", output: "8" }
    ],
    tags: ["array", "binary-search"]
  },
  {
    title: "Find First and Last Position of Element in Sorted Array",
    difficulty: "Medium",
    description: "Given an array of integers `nums` sorted in non-decreasing order, find the starting and ending position of a given `target` value.",
    examples: [
      { input: "nums = [5,7,7,8,8,10], target = 8", output: "[3,4]", explanation: "Target 8 is found at indices 3 and 4." }
    ],
    constraints: ["0 <= nums.length <= 10^5"],
    visibleTestCases: [
      { input: "6\n5 7 7 8 8 10\n8", output: "3 4" },
      { input: "6\n5 7 7 8 8 10\n6", output: "-1 -1" },
      { input: "0\n\n0", output: "-1 -1" }
    ],
    hiddenTestCases: [
      { input: "1\n1\n1", output: "0 0" }, { input: "2\n1 1\n1", output: "0 1" },
      { input: "3\n1 2 3\n2", output: "1 1" }, { input: "4\n1 1 1 1\n1", output: "0 3" },
      { input: "5\n1 2 2 2 3\n2", output: "1 3" }, { input: "7\n1 2 3 3 3 4 5\n3", output: "2 4" },
      { input: "8\n0 0 1 1 2 2 2 3\n2", output: "4 6" }, { input: "6\n2 2 2 2 2 2\n2", output: "0 5" },
      { input: "5\n1 3 5 7 9\n5", output: "2 2" }, { input: "9\n1 1 2 2 2 3 3 3 4\n3", output: "5 7" },
      { input: "10\n0 1 2 3 4 5 6 7 8 9\n5", output: "5 5" }, { input: "4\n1 2 3 4\n0", output: "-1 -1" }
    ],
    tags: ["array", "binary-search"]
  },
  {
    title: "Sudoku Solver",
    difficulty: "Hard",
    description: "Write a program to solve a Sudoku puzzle by filling the empty cells. A sudoku solution must satisfy all of the following rules.",
    examples: [
      { input: "9x9 partially filled board", output: "completed valid sudoku", explanation: "Fill empty cells to complete sudoku." }
    ],
    constraints: ["board.length == 9", "board[i].length == 9"],
    visibleTestCases: [
      { input: "53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79", output: "534678912672195348198342567859761423426853791713924856961537284287419635345286179" }
    ],
    hiddenTestCases: [
      { input: "..9748...7.........2.1.9.....7...24..64.1..28...9.....8.3.2.........6...2759..", output: "519748632783652194426139875857216349936421587241897653698375241375284916162593478" },
      { input: ".2.......6....41.......2......2.3....8..4..1....1.7......54.......79....6.......", output: "324916857867254139951837246672593418583742691419681375738165924145328769296479583" },
      { input: "4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4.....", output: "417369825632158947958724316825437169791586432346912758289645173573291684164873259" },
      { input: "52...6.........7.13...........4..8..6......5...........418.........3..2...87.....", output: "527836914968174235134529687379451826681293475245687139412768593856312749793485162" },
      { input: "6.....7.3.4.8.................5.4...6..7...8.1...2.......................9.....5..", output: "685412793349876521271359864597248136462731958138965247754623189813597642926184375" },
      { input: ".......1....7.9..3..2...8....8..9....5.........7..4....3...9..5..2.3....2.......", output: "846297315125739468379126854798563142651842937234915786467381529583274691912658473" },
      { input: "..2.3...8.....8....31.2.....6..5.27......1...3.4.82......7.....2..4..5.....1...", output: "672435198549178362831629457368951274157264839294387516486713925713592684925846731" },
      { input: ".......2.3.1.......6.....5..1..9..8..........4...6.....3.....4.......2.7.......", output: "897643521341582697265917458513794286729865143486321975158239764674158329932476815" }
    ],
    tags: ["array", "backtracking", "matrix"]
  },
  {
    title: "Count Primes",
    difficulty: "Medium",
    description: "Given an integer `n`, return the number of prime numbers that are less than `n`.",
    examples: [
      { input: "n = 10", output: "4", explanation: "There are 4 prime numbers less than 10, they are 2, 3, 5, 7." }
    ],
    constraints: ["0 <= n <= 5 * 10^6"],
    visibleTestCases: [
      { input: "10", output: "4" },
      { input: "0", output: "0" },
      { input: "1", output: "0" }
    ],
    hiddenTestCases: [
      { input: "2", output: "0" }, { input: "3", output: "1" }, { input: "5", output: "2" },
      { input: "11", output: "4" }, { input: "13", output: "5" }, { input: "17", output: "6" },
      { input: "20", output: "8" }, { input: "30", output: "10" }, { input: "50", output: "15" },
      { input: "100", output: "25" }, { input: "200", output: "46" }, { input: "499979", output: "41537" },
      { input: "999983", output: "78497" }, { input: "1500000", output: "114155" }, { input: "5000000", output: "348513" }
    ],
    tags: ["array", "math", "enumeration", "number-theory"]
  },
  {
    title: "Isomorphic Strings",
    difficulty: "Easy",
    description: "Given two strings `s` and `t`, determine if they are isomorphic. Two strings are isomorphic if the characters in `s` can be replaced to get `t`.",
    examples: [
      { input: "s = \"egg\", t = \"add\"", output: "true", explanation: "The strings are isomorphic." }
    ],
    constraints: ["1 <= s.length <= 5 * 10^4"],
    visibleTestCases: [
      { input: "egg\nadd", output: "true" },
      { input: "foo\nbar", output: "false" },
      { input: "paper\ntitle", output: "true" }
    ],
    hiddenTestCases: [
      { input: "a\na", output: "true" }, { input: "ab\naa", output: "false" },
      { input: "ab\nca", output: "true" }, { input: "abc\ndef", output: "true" },
      { input: "abcd\nefgh", output: "true" }, { input: "abba\ncddc", output: "true" },
      { input: "abba\ncdcd", output: "false" }, { input: "abc\nabc", output: "true" },
      { input: "badc\nbaba", output: "false" }, { input: "abcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz", output: "true" },
      { input: "abcdefghijklmnopqrstuvwxyz\nbcdefghijklmnopqrstuvwxyza", output: "true" }, { input: "13\n42", output: "false" }
    ],
    tags: ["hash-table", "string"]
  },
  {
    title: "Reverse Linked List",
    difficulty: "Easy",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]", explanation: "Reverse the entire list." }
    ],
    constraints: ["The number of nodes in the list is the range [0, 5000]."],
    visibleTestCases: [
      { input: "5\n1 2 3 4 5", output: "5 4 3 2 1" },
      { input: "2\n1 2", output: "2 1" },
      { input: "0\n", output: "" }
    ],
    hiddenTestCases: [
      { input: "1\n1", output: "1" }, { input: "3\n1 2 3", output: "3 2 1" },
      { input: "4\n1 2 3 4", output: "4 3 2 1" }, { input: "6\n1 2 3 4 5 6", output: "6 5 4 3 2 1" },
      { input: "7\n7 6 5 4 3 2 1", output: "1 2 3 4 5 6 7" }, { input: "8\n-1 0 1 2 3 4 5 6", output: "6 5 4 3 2 1 0 -1" },
      { input: "9\n9 8 7 6 5 4 3 2 1", output: "1 2 3 4 5 6 7 8 9" }, { input: "10\n0 1 2 3 4 5 6 7 8 9", output: "9 8 7 6 5 4 3 2 1 0" },
      { input: "2\n-1 -2", output: "-2 -1" }, { input: "5\n100 200 300 400 500", output: "500 400 300 200 100" }
    ],
    tags: ["linked-list", "recursion"]
  },
  {
    title: "Course Schedule",
    difficulty: "Medium",
    description: "There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [ai, bi]` indicates that you must take course `bi` first if you want to take course `ai`.",
    examples: [
      { input: "numCourses = 2, prerequisites = [[1,0]]", output: "true", explanation: "There are a total of 2 courses to take. To take course 1 you should have finished course 0." }
    ],
    constraints: ["1 <= numCourses <= 10^5"],
    visibleTestCases: [
      { input: "2\n1\n1 0", output: "true" },
      { input: "2\n2\n1 0\n0 1", output: "false" }
    ],
    hiddenTestCases: [
      { input: "1\n0", output: "true" }, { input: "3\n3\n0 1\n0 2\n1 2", output: "true" },
      { input: "4\n4\n0 1\n1 2\n2 3\n3 0", output: "false" }, { input: "5\n4\n0 1\n1 2\n2 3\n4 0", output: "true" },
      { input: "3\n2\n1 0\n2 0", output: "true" }, { input: "4\n3\n1 0\n2 1\n3 2", output: "true" },
      { input: "6\n6\n0 1\n1 2\n2 3\n3 4\n4 5\n5 0", output: "false" }, { input: "4\n5\n0 1\n1 2\n2 0\n1 3\n3 1", output: "false" },
      { input: "7\n6\n1 0\n2 0\n3 1\n3 2\n4 3\n5 4", output: "true" }, { input: "8\n7\n0 1\n0 2\n1 3\n2 3\n3 4\n4 5\n5 6", output: "true" }
    ],
    tags: ["depth-first-search", "breadth-first-search", "graph", "topological-sort"]
  },
  {
    title: "Course Schedule II",
    difficulty: "Medium",
    description: "There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. Return the ordering of courses you should take to finish all courses.",
    examples: [
      { input: "numCourses = 2, prerequisites = [[1,0]]", output: "[0,1]", explanation: "There are a total of 2 courses to take. To take course 1 you should have finished course 0." }
    ],
    constraints: ["1 <= numCourses <= 2000"],
    visibleTestCases: [
      { input: "2\n1\n1 0", output: "0 1" },
      { input: "4\n4\n1 0\n2 0\n3 1\n3 2", output: "0 1 2 3" },
      { input: "1\n0", output: "0" }
    ],
    hiddenTestCases: [
      { input: "3\n3\n0 1\n0 2\n1 2", output: "2 1 0" }, { input: "2\n2\n1 0\n0 1", output: "" },
      { input: "5\n4\n0 1\n1 2\n2 3\n4 0", output: "3 2 1 0 4" }, { input: "3\n2\n1 0\n2 0", output: "0 1 2" },
      { input: "6\n5\n1 0\n2 1\n3 2\n4 3\n5 4", output: "0 1 2 3 4 5" }, { input: "4\n3\n1 0\n2 1\n0 2", output: "" },
      { input: "7\n6\n1 0\n2 0\n3 1\n3 2\n4 3\n5 4", output: "0 1 2 3 4 5 6" }, { input: "5\n5\n0 1\n1 2\n2 3\n3 4\n4 0", output: "" },
      { input: "8\n7\n0 1\n0 2\n1 3\n2 3\n3 4\n4 5\n5 6", output: "0 1 2 3 4 5 6 7" }
    ],
    tags: ["depth-first-search", "breadth-first-search", "graph", "topological-sort"]
  },
  {
    title: "Design Add and Search Words Data Structure",
    difficulty: "Medium",
    description: "Design a data structure that supports adding new words and finding if a string matches any previously added string.",
    examples: [
      { input: "operations", output: "results", explanation: "Support add and search with wildcard." }
    ],
    constraints: ["1 <= word.length <= 25"],
    visibleTestCases: [
      { input: "WordDictionary\nadd bad\nadd dad\nadd mad\nsearch pad\nsearch bad\nsearch .ad\nsearch b..", output: "null\nnull\nnull\nnull\nfalse\ntrue\ntrue\ntrue" }
    ],
    hiddenTestCases: [
      { input: "WordDictionary\nadd a\nsearch .", output: "null\nnull\ntrue" },
      { input: "WordDictionary\nadd ab\nsearch a\nsearch ab\nsearch a.\nsearch .b", output: "null\nnull\nfalse\ntrue\ntrue\ntrue" },
      { input: "WordDictionary\nadd cat\nadd car\nsearch c..\nsearch ca.\nsearch c.t", output: "null\nnull\nnull\ntrue\ntrue\ntrue" },
      { input: "WordDictionary\nadd hello\nsearch h....\nsearch ....o\nsearch h..lo", output: "null\nnull\ntrue\ntrue\nfalse" },
      { input: "WordDictionary\nadd word\nsearch word\nsearch wor.\nsearch w..d\nsearch ....", output: "null\nnull\ntrue\ntrue\ntrue\ntrue" },
      { input: "WordDictionary\nadd test\nadd testing\nsearch test\nsearch ..st\nsearch test...", output: "null\nnull\nnull\ntrue\ntrue\nfalse" }
    ],
    tags: ["string", "depth-first-search", "design", "trie"]
  },
  {
    title: "House Robber",
    difficulty: "Medium",
    description: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. Adjacent houses have security systems connected.",
    examples: [
      { input: "nums = [1,2,3,1]", output: "4", explanation: "Rob house 0 (money = 1) and then rob house 2 (money = 3). Total amount = 1 + 3 = 4." }
    ],
    constraints: ["1 <= nums.length <= 100"],
    visibleTestCases: [
      { input: "4\n1 2 3 1", output: "4" },
      { input: "5\n2 7 9 3 1", output: "12" }
    ],
    hiddenTestCases: [
      { input: "1\n5", output: "5" }, { input: "2\n1 2", output: "2" }, { input: "3\n2 1 1", output: "2" },
      { input: "6\n5 1 3 9 4 2", output: "15" }, { input: "7\n1 3 1 3 100 4 2", output: "103" },
      { input: "8\n2 4 9 9 2 7 5 1", output: "21" }, { input: "3\n5 5 10", output: "15" },
      { input: "9\n1 2 3 4 5 6 7 8 9", output: "25" }, { input: "10\n10 1 1 10 1 1 10 1 1 10", output: "40" },
      { input: "4\n100 1 1 100", output: "200" }, { input: "5\n1 1 1 1 1", output: "3" }
    ],
    tags: ["array", "dynamic-programming"]
  },
  {
    title: "House Robber II",
    difficulty: "Medium",
    description: "You are a professional robber planning to rob houses along a street. All houses at this place are arranged in a circle. Adjacent houses have security systems connected.",
    examples: [
      { input: "nums = [2,3,2]", output: "3", explanation: "You cannot rob house 0 and 2 (since they are adjacent), so rob house 1 (money = 3)." }
    ],
    constraints: ["1 <= nums.length <= 100"],
    visibleTestCases: [
      { input: "3\n2 3 2", output: "3" },
      { input: "4\n1 2 3 1", output: "4" },
      { input: "1\n1", output: "1" }
    ],
    hiddenTestCases: [
      { input: "2\n1 2", output: "2" }, { input: "5\n2 7 9 3 1", output: "11" },
      { input: "6\n5 1 3 9 4 2", output: "14" }, { input: "7\n1 3 1 3 100 4 2", output: "103" },
      { input: "8\n2 4 9 9 2 7 5 1", output: "21" }, { input: "3\n5 5 10", output: "10" },
      { input: "9\n1 2 3 4 5 6 7 8 9", output: "24" }, { input: "10\n10 1 1 10 1 1 10 1 1 10", output: "30" },
      { input: "4\n100 1 1 100", output: "100" }, { input: "5\n1 1 1 1 1", output: "2" }
    ],
    tags: ["array", "dynamic-programming"]
  },
  {
    title: "Perfect Squares",
    difficulty: "Medium",
    description: "Given an integer `n`, return the least number of perfect square numbers that sum to `n`.",
    examples: [
      { input: "n = 12", output: "3", explanation: "12 = 4 + 4 + 4." }
    ],
    constraints: ["1 <= n <= 10^4"],
    visibleTestCases: [
      { input: "12", output: "3" },
      { input: "13", output: "2" }
    ],
    hiddenTestCases: [
      { input: "1", output: "1" }, { input: "2", output: "2" }, { input: "3", output: "3" },
      { input: "4", output: "1" }, { input: "5", output: "2" }, { input: "6", output: "3" },
      { input: "7", output: "4" }, { input: "8", output: "2" }, { input: "9", output: "1" },
      { input: "10", output: "2" }, { input: "11", output: "3" }, { input: "15", output: "4" },
      { input: "16", output: "1" }, { input: "17", output: "2" }, { input: "18", output: "2" },
      { input: "25", output: "1" }, { input: "26", output: "2" }, { input: "100", output: "1" }
    ],
    tags: ["math", "dynamic-programming", "breadth-first-search"]
  },
  {
    title: "Move Zeroes",
    difficulty: "Easy",
    description: "Given an integer array `nums`, move all `0`'s to the end of it while maintaining the relative order of the non-zero elements.",
    examples: [
      { input: "nums = [0,1,0,3,12]", output: "[1,3,12,0,0]", explanation: "Move zeros to end." }
    ],
    constraints: ["1 <= nums.length <= 10^4"],
    visibleTestCases: [
      { input: "5\n0 1 0 3 12", output: "1 3 12 0 0" },
      { input: "1\n0", output: "0" },
      { input: "1\n1", output: "1" }
    ],
    hiddenTestCases: [
      { input: "2\n0 0", output: "0 0" }, { input: "3\n1 2 3", output: "1 2 3" },
      { input: "4\n0 0 0 1", output: "1 0 0 0" }, { input: "5\n1 0 2 0 3", output: "1 2 3 0 0" },
      { input: "6\n0 1 2 0 3 4", output: "1 2 3 4 0 0" }, { input: "7\n1 0 0 2 0 3 0", output: "1 2 3 0 0 0 0" },
      { input: "8\n0 0 0 0 1 2 3 4", output: "1 2 3 4 0 0 0 0" }, { input: "4\n1 2 0 0", output: "1 2 0 0" },
      { input: "6\n0 0 1 0 0 2", output: "1 2 0 0 0 0" }, { input: "9\n1 0 2 0 3 0 4 0 5", output: "1 2 3 4 5 0 0 0 0" }
    ],
    tags: ["array", "two-pointers"]
  },
  {
    title: "Find the Duplicate Number",
    difficulty: "Medium",
    description: "Given an array of integers `nums` containing `n + 1` integers where each integer is in the range `[1, n]` inclusive. There is only one repeated number in `nums`, return this repeated number.",
    examples: [
      { input: "nums = [1,3,4,2,2]", output: "2", explanation: "The duplicate number is 2." }
    ],
    constraints: ["1 <= n <= 10^5"],
    visibleTestCases: [
      { input: "5\n1 3 4 2 2", output: "2" },
      { input: "5\n3 1 3 4 2", output: "3" },
      { input: "2\n1 1", output: "1" }
    ],
    hiddenTestCases: [
      { input: "3\n2 2 2", output: "2" }, { input: "4\n4 3 1 4", output: "4" },
      { input: "6\n1 2 3 4 5 3", output: "3" }, { input: "7\n2 5 9 6 9 3 8", output: "9" },
      { input: "8\n1 2 3 4 5 6 7 4", output: "4" }, { input: "9\n8 7 1 10 17 15 18 11 7", output: "7" },
      { input: "10\n2 5 9 6 9 3 8 9 7 1", output: "9" }, { input: "4\n1 4 4 2", output: "4" },
      { input: "11\n13 46 8 11 20 17 40 13 13 17 13", output: "13" }, { input: "6\n5 2 1 3 5 7", output: "5" }
    ],
    tags: ["array", "two-pointers", "binary-search", "bit-manipulation"]
  },
  {
    title: "Game of Life",
    difficulty: "Medium",
    description: "According to Wikipedia's article: \"The Game of Life, also known simply as Life, is a cellular automaton devised by the British mathematician John Horton Conway in 1970.\"",
    examples: [
      { input: "board = [[0,1,0],[0,0,1],[1,1,1],[0,0,0]]", output: "[[0,0,0],[1,0,1],[0,1,1],[0,1,0]]", explanation: "Apply Game of Life rules." }
    ],
    constraints: ["m == board.length", "n == board[i].length"],
    visibleTestCases: [
      { input: "4 3\n0 1 0\n0 0 1\n1 1 1\n0 0 0", output: "0 0 0\n1 0 1\n0 1 1\n0 1 0" },
      { input: "2 2\n1 1\n1 0", output: "1 1\n1 1" }
    ],
    hiddenTestCases: [
      { input: "1 1\n0", output: "0" }, { input: "1 1\n1", output: "0" },
      { input: "2 3\n1 1 0\n1 1 0", output: "1 1 0\n1 1 0" }, { input: "3 3\n0 0 0\n0 1 0\n0 0 0", output: "0 0 0\n0 0 0\n0 0 0" },
      { input: "3 3\n1 1 1\n1 1 1\n1 1 1", output: "1 0 1\n0 0 0\n1 0 1" }, { input: "4 4\n1 0 0 1\n0 1 1 0\n0 1 1 0\n1 0 0 1", output: "0 0 0 0\n0 1 1 0\n0 1 1 0\n0 0 0 0" },
      { input: "5 5\n0 1 0 1 0\n1 0 1 0 1\n0 1 0 1 0\n1 0 1 0 1\n0 1 0 1 0", output: "0 0 0 0 0\n0 0 1 0 0\n0 1 0 1 0\n0 0 1 0 0\n0 0 0 0 0" },
      { input: "3 4\n1 1 0 0\n1 1 0 0\n0 0 1 1", output: "1 1 0 0\n1 0 0 0\n0 0 0 1" }
    ],
    tags: ["array", "matrix", "simulation"]
  },
  {
    title: "Word Search",
    difficulty: "Medium",
    description: "Given an `m x n` grid of characters `board` and a string `word`, return `true` if `word` exists in the grid.",
    examples: [
      { input: "board = [[\"A\",\"B\",\"C\",\"E\"],[\"S\",\"F\",\"C\",\"S\"],[\"A\",\"D\",\"E\",\"E\"]], word = \"ABCCED\"", output: "true", explanation: "Word exists in grid." }
    ],
    constraints: ["m == board.length", "n = board[i].length"],
    visibleTestCases: [
      { input: "3 4\nA B C E\nS F C S\nA D E E\nABCCED", output: "true" },
      { input: "3 4\nA B C E\nS F C S\nA D E E\nSEE", output: "true" },
      { input: "3 4\nA B C E\nS F C S\nA D E E\nABCB", output: "false" }
    ],
    hiddenTestCases: [
      { input: "1 1\nA\nA", output: "true" }, { input: "1 1\nA\nB", output: "false" },
      { input: "2 2\nA B\nC D\nAB", output: "true" }, { input: "2 2\nA B\nC D\nAC", output: "true" },
      { input: "3 3\nA B C\nD E F\nG H I\nAEI", output: "true" }, { input: "3 3\nA B C\nD E F\nG H I\nADG", output: "true" },
      { input: "4 4\nA B C E\nS F C S\nA D E E\nB A C F", output: "false" }, { input: "2 3\nA A A\nA A A\nAAAAA", output: "true" },
      { input: "1 4\nA B C D\nDCBA", output: "true" }, { input: "4 1\nA\nB\nC\nD\nABCD", output: "true" }
    ],
    tags: ["array", "backtracking", "matrix"]
  },
  {
    title: "Set Matrix Zeroes",
    difficulty: "Medium",
    description: "Given an `m x n` integer matrix `matrix`, if an element is 0, set its entire row and column to 0's.",
    examples: [
      { input: "matrix = [[1,1,1],[1,0,1],[1,1,1]]", output: "[[1,0,1],[0,0,0],[1,0,1]]", explanation: "Set row and column of zero to zeros." }
    ],
    constraints: ["m == matrix.length", "n == matrix[0].length"],
    visibleTestCases: [
      { input: "3 3\n1 1 1\n1 0 1\n1 1 1", output: "1 0 1\n0 0 0\n1 0 1" },
      { input: "3 4\n0 1 2 0\n3 4 5 2\n1 3 1 5", output: "0 0 0 0\n0 4 5 0\n0 3 1 0" }
    ],
    hiddenTestCases: [
      { input: "1 1\n0", output: "0" }, { input: "1 1\n1", output: "1" },
      { input: "2 2\n1 1\n1 1", output: "1 1\n1 1" }, { input: "2 2\n0 1\n1 1", output: "0 0\n0 1" },
      { input: "3 3\n0 0 0\n1 1 1\n1 1 1", output: "0 0 0\n0 0 0\n0 0 0" }, { input: "4 4\n1 2 3 4\n5 0 7 8\n0 10 11 12\n13 14 15 0", output: "0 0 3 0\n0 0 0 0\n0 0 0 0\n0 0 0 0" },
      { input: "2 3\n1 0 3\n4 5 6", output: "0 0 0\n4 0 6" }, { input: "3 2\n1 2\n3 0\n5 6", output: "1 0\n0 0\n5 0" },
      { input: "4 5\n-1 2 -3 4 0\n6 -7 8 -9 10\n11 -12 13 14 -15\n16 0 -17 18 19", output: "0 0 -3 4 0\n6 0 8 -9 0\n11 0 13 14 0\n0 0 0 18 0" }
    ],
    tags: ["array", "hash-table", "matrix"]
  },
  {
    title: "Search a 2D Matrix",
    difficulty: "Medium",
    description: "Write an efficient algorithm that searches for a value `target` in an `m x n` integer matrix `matrix`.",
    examples: [
      { input: "matrix = [[1,4,7,11,15],[2,5,8,12,19],[3,6,9,16,22],[10,13,14,17,24],[18,21,23,26,30]], target = 5", output: "true", explanation: "Target 5 exists in matrix." }
    ],
    constraints: ["m == matrix.length", "n == matrix[i].length"],
    visibleTestCases: [
      { input: "5 5\n1 4 7 11 15\n2 5 8 12 19\n3 6 9 16 22\n10 13 14 17 24\n18 21 23 26 30\n5", output: "true" },
      { input: "5 5\n1 4 7 11 15\n2 5 8 12 19\n3 6 9 16 22\n10 13 14 17 24\n18 21 23 26 30\n14", output: "false" }
    ],
    hiddenTestCases: [
      { input: "1 1\n1\n1", output: "true" }, { input: "1 1\n1\n2", output: "false" },
      { input: "2 2\n1 3\n2 4\n3", output: "true" }, { input: "3 3\n1 2 3\n4 5 6\n7 8 9\n5", output: "true" },
      { input: "3 3\n1 2 3\n4 5 6\n7 8 9\n10", output: "false" }, { input: "4 4\n1 4 7 11\n2 5 8 12\n3 6 9 16\n10 13 14 17\n13", output: "true" },
      { input: "2 3\n1 2 3\n4 5 6\n2", output: "true" }, { input: "3 2\n1 2\n3 4\n5 6\n4", output: "true" },
      { input: "5 4\n1 3 5 7\n10 11 16 20\n23 30 34 60\n61 62 63 64\n65 66 67 68\n3", output: "true" }
    ],
    tags: ["array", "binary-search", "matrix"]
  },
  {
    title: "Sort Colors",
    difficulty: "Medium",
    description: "Given an array `nums` with `n` objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order red, white, and blue.",
    examples: [
      { input: "nums = [2,0,2,1,1,0]", output: "[0,0,1,1,2,2]", explanation: "Sort colors in place." }
    ],
    constraints: ["n == nums.length"],
    visibleTestCases: [
      { input: "6\n2 0 2 1 1 0", output: "0 0 1 1 2 2" },
      { input: "3\n2 0 1", output: "0 1 2" },
      { input: "1\n0", output: "0" }
    ],
    hiddenTestCases: [
      { input: "1\n1", output: "1" }, { input: "1\n2", output: "2" },
      { input: "2\n1 0", output: "0 1" }, { input: "3\n0 0 0", output: "0 0 0" },
      { input: "4\n1 1 1 1", output: "1 1 1 1" }, { input: "5\n2 2 2 2 2", output: "2 2 2 2 2" },
      { input: "7\n2 0 1 2 1 0 2", output: "0 0 1 1 2 2 2" }, { input: "8\n1 2 0 1 2 0 1 2", output: "0 0 1 1 1 2 2 2" },
      { input: "9\n0 1 2 0 1 2 0 1 2", output: "0 0 0 1 1 1 2 2 2" }, { input: "10\n2 1 0 2 1 0 2 1 0 1", output: "0 0 0 1 1 1 1 2 2 2" }
    ],
    tags: ["array", "two-pointers", "sorting"]
  },

  // Final batch to reach 150 problems
  {
    title: "Minimum Window Substring",
    difficulty: "Hard",
    description: "Given two strings `s` and `t` of lengths `m` and `n` respectively, return the minimum window substring of `s` such that every character in `t` (including duplicates) is included in the window.",
    examples: [
      { input: "s = \"ADOBECODEBANC\", t = \"ABC\"", output: "\"BANC\"", explanation: "The minimum window substring \"BANC\" includes all characters of t." }
    ],
    constraints: ["m == s.length", "n == t.length"],
    visibleTestCases: [
      { input: "ADOBECODEBANC\nABC", output: "BANC" },
      { input: "a\na", output: "a" },
      { input: "a\naa", output: "" }
    ],
    hiddenTestCases: [
      { input: "ab\nb", output: "b" }, { input: "abc\ncba", output: "abc" },
      { input: "ADOBECODEBANC\nAABC", output: "ADOBEC" }, { input: "a\nb", output: "" },
      { input: "aa\naa", output: "aa" }, { input: "bba\nab", output: "ba" },
      { input: "abc\nabc", output: "abc" }, { input: "cabwefgewcwaefgcf\ncae", output: "cwae" },
      { input: "wegdtzwabazduwwdysdetrrctotpcepalabbdgfjjlcjbacbggcbgibegadc\nabcabccghi", output: "abdgfjjlcjbacbggcbgibegadc" },
      { input: "ask_not_what_your_country_can_do_for_you_ask_what_you_can_do_for_your_country\nask", output: "ask" }
    ],
    tags: ["hash-table", "string", "sliding-window"]
  },
  {
    title: "Edit Distance",
    difficulty: "Hard",
    description: "Given two strings `word1` and `word2`, return the minimum number of operations required to convert `word1` to `word2`.",
    examples: [
      { input: "word1 = \"horse\", word2 = \"ros\"", output: "3", explanation: "horse -> rorse (replace 'h' with 'r'), rorse -> rose (remove 'r'), rose -> ros (remove 'e')." }
    ],
    constraints: ["0 <= word1.length, word2.length <= 500"],
    visibleTestCases: [
      { input: "horse\nros", output: "3" },
      { input: "intention\nexecution", output: "5" }
    ],
    hiddenTestCases: [
      { input: "\n", output: "0" }, { input: "a\n", output: "1" }, { input: "\na", output: "1" },
      { input: "a\na", output: "0" }, { input: "ab\nac", output: "1" }, { input: "abc\ndef", output: "3" },
      { input: "sunday\nsaturday", output: "3" }, { input: "kitten\nsitting", output: "3" },
      { input: "flaw\nlawn", output: "2" }, { input: "gumbo\ngambol", output: "2" },
      { input: "saturday\nsunday", output: "3" }, { input: "exponential\npolynomial", output: "6" }
    ],
    tags: ["string", "dynamic-programming"]
  }
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