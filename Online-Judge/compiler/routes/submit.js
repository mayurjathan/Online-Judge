const express = require("express");
const router = express.Router();

const generateFile = require("../utils/generateFile");
const { compileCpp, runCpp } = require("../execution/executeCpp");
const { compileC, runC } = require("../execution/executeC");
const { runPython } = require("../execution/executePython");
const { runJavaDirect } = require("../execution/executeJava");

const Problem = require("../services/Problem"); 

router.post("/submit", async (req, res) => {
  const { code, language = "cpp", problemId } = req.body;

  if (!code || !problemId) {
    return res.status(400).json({ error: "Missing code or problem ID" });
  }

  try {
    // 1. Fetch hidden test cases from DB
    const problem = await Problem.findById(problemId).lean();

    if (!problem || !problem.hiddenTestCases || problem.hiddenTestCases.length === 0) {
      return res.status(404).json({ error: "Problem or test cases not found" });
    }

    const testCases = problem.hiddenTestCases;
    const filepath = await generateFile(language, code);
    const results = [];
    let passedAll = true;

    let executablePath = "";

    if (language === "cpp") executablePath = compileCpp(filepath);
    else if (language === "c") executablePath = compileC(filepath);

    for (const test of testCases) {
      try {
        let output = "";

        if (language === "cpp") output = await runCpp(executablePath, test.input);
        else if (language === "c") output = await runC(executablePath, test.input);
        else if (language === "python") output = await runPython(filepath, test.input);
        else if (language === "java") output = await runJavaDirect(filepath, test.input);
        else throw new Error("Unsupported language");

        const actual = output.trim();
        const expected = test.output.trim();
        const passed = actual === expected;

        if (!passed) passedAll = false;

        results.push({
          input: test.input,
          passed,
        });
      } catch (err) {
        passedAll = false;
        results.push({
          input: test.input,
          expectedOutput: test.output.trim(),
          actualOutput: err.message || "Error occurred",
          passed: false,
        });
      }
    }

    res.json({ passedAll, results });

  } catch (err) {
    console.error("Submission error:", err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

module.exports = router;
