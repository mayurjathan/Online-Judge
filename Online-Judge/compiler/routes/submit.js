const express = require("express");
const router = express.Router();

const generateFile = require("../utils/generateFile");
const generateInputFile = require("../utils/generateInputFile");

const executeCpp = require("../execution/executeCpp");
const executeC = require("../execution/executeC");
const executePython = require("../execution/executePython");
const executeJava = require("../execution/executeJava");

router.post("/", async (req, res) => {
  const { code, language = "cpp", testCases = [] } = req.body;

  if (!code || !Array.isArray(testCases) || testCases.length === 0) {
    return res.status(400).json({ error: "Missing code or test cases" });
  }

  try {
    const filepath = await generateFile(language, code);
    const results = [];
    let passedAll = true;

    for (const test of testCases) {
      const inputPath = await generateInputFile(test.input);
      let output = "";
      let error = null;

      try {
        switch (language) {
          case "cpp":
            output = await executeCpp(filepath, inputPath);
            break;
          case "c":
            output = await executeC(filepath, inputPath);
            break;
          case "python":
            output = await executePython(filepath, inputPath);
            break;
          case "java":
            output = await executeJava(filepath, inputPath);
            break;
          default:
            throw new Error("Unsupported language");
        }

        const actual = output.trim();
        const expected = test.output.trim();
        const passed = actual === expected;

        if (!passed) passedAll = false;

        results.push({
          input: test.input,
          expectedOutput: expected,
          actualOutput: actual,
          passed,
        });

      } catch (err) {
        passedAll = false;
        error = err.message || "Execution error";
        results.push({
          input: test.input,
          expectedOutput: test.output.trim(),
          actualOutput: error,
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
