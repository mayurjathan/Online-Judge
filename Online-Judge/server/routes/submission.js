const express = require("express");
const router = express.Router();
const Submission = require("../models/Submission");
const Problem = require("../models/Problem");

const generateFile = require("../utils/generateFile");
const executeCpp = require("../execution/executeCpp");
const executeC = require("../execution/executeC");
const executePython = require("../execution/executePython");
const executeJava = require("../execution/executeJava");

const formatInput = (inputStr) => {
  try {
    const numsMatch = inputStr.match(/nums\s*=\s*\[(.*?)\]/);
    const targetMatch = inputStr.match(/target\s*=\s*(\d+)/);

    if (!numsMatch || !targetMatch) return inputStr; // fallback if format doesn't match

    const nums = numsMatch[1].split(",").map((n) => parseInt(n.trim()));
    const target = targetMatch[1];

    return `${nums.length}\n${nums.join(" ")}\n${target}`;
  } catch (e) {
    return inputStr;
  }
};

router.post("/", async (req, res) => {
  const { code, language, problemId } = req.body;

  if (!code || !language || !problemId)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    const filepath = await generateFile(language, code);
    const problem = await Problem.findById(problemId);
    const hiddenTests = problem.hiddenTestCases || [];

    let results = [];
    let allPassed = true;

    for (let test of hiddenTests) {
      const formattedInput = formatInput(test.input);
      let output;

      try {
        switch (language) {
          case "cpp":
            output = await executeCpp(filepath, formattedInput);
            break;
          case "c":
            output = await executeC(filepath, formattedInput);
            break;
          case "python":
            output = await executePython(filepath, formattedInput);
            break;
          case "java":
            output = await executeJava(filepath, formattedInput);
            break;
          default:
            throw new Error("Unsupported language");
        }
      } catch (err) {
        output = err.toString();
        allPassed = false;
      }

      const passed = output.trim() === test.output.trim();
      if (!passed) allPassed = false;

      results.push({
        input: test.input,
        expectedOutput: test.output,
        actualOutput: output.trim(),
        passed,
      });
    }

    const submission = await Submission.create({
      problemId,
      code,
      language,
      result: allPassed ? "Passed" : "Failed",
      testResults: results,
    });

    res.json({ result: submission.result, testResults: results });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

module.exports = router;
