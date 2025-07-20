const express = require("express");
const router = express.Router();
const fs = require("fs");

const generateFile = require("../utils/generateFile");
const generateInputFile = require("../utils/generateInputFile");

const { compileCpp, runCpp } = require("../execution/executeCpp");
const { compileC, runC } = require("../execution/executeC");
const { runPython } = require("../execution/executePython");
const { runJavaDirect } = require("../execution/executeJava");

router.post("/run", async (req, res) => {
  const { language = "cpp", code, input = "" } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  let filepath = null;
  let inputPath = null;
  let executablePath = null;

  try {
    filepath = await generateFile(language, code);
    inputPath = await generateInputFile(input);
    
    let output = "";
    const timeLimit = 5000; // 5 seconds

    switch (language) {
      case "cpp":
        executablePath = compileCpp(filepath);
        output = await runCpp(executablePath, input, timeLimit);
        break;
      case "c":
        executablePath = compileC(filepath);
        output = await runC(executablePath, input, timeLimit);
        break;
      case "python":
        output = await runPython(filepath, input, timeLimit);
        break;
      case "java":
        output = await runJavaDirect(filepath, input, timeLimit);
        break;
      default:
        return res.status(400).json({ error: "Unsupported language" });
    }

    return res.json({ output });

  } catch (err) {
    console.error("Run error:", err);
    
    // Handle specific errors
    if (err.message.includes("Time Limit Exceeded")) {
      return res.status(408).json({ error: "Time Limit Exceeded" });
    }
    if (err.message.includes("Memory Limit Exceeded")) {
      return res.status(413).json({ error: "Memory Limit Exceeded" });
    }
    if (err.message.includes("Compilation Error")) {
      return res.status(400).json({ error: "Compilation Error", message: err.message });
    }
    
    return res.status(500).json({ error: "Execution failed", message: err.message });
    
  } finally {
    // Cleanup files
    try {
      if (filepath && fs.existsSync(filepath)) fs.unlinkSync(filepath);
      if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (executablePath && fs.existsSync(executablePath)) fs.unlinkSync(executablePath);
    } catch (cleanupErr) {
      console.error("Cleanup error:", cleanupErr);
    }
  }
});

module.exports = router;