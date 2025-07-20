const express = require("express");
const router = express.Router();
const axios = require("axios");
const generateFile = require("../utils/generateFile");
const { compileCpp, runCpp } = require("../execution/executeCpp");
const { compileC, runC } = require("../execution/executeC");
const { runPython } = require("../execution/executePython");
const { runJavaDirect } = require("../execution/executeJava");
const fs = require("fs");
const path = require("path");

// Rate limiting
const submitRateLimit = new Map();
const checkSubmitRateLimit = (ip) => {
  const now = Date.now();
  const userSubmissions = submitRateLimit.get(ip) || [];
  const recentSubmissions = userSubmissions.filter(time => now - time < 300000);
  
  if (recentSubmissions.length >= 5) {
    throw new Error("Submission rate limit exceeded. Please try again later.");
  }
  
  recentSubmissions.push(now);
  submitRateLimit.set(ip, recentSubmissions);
};

// Extract user ID from token
const extractUserIdFromToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

router.post("/submit", async (req, res) => {
  const { code, language = "cpp", problemId } = req.body;
  const clientIP = req.ip || req.connection.remoteAddress;
  const authHeader = req.headers.authorization;
  const userId = extractUserIdFromToken(authHeader);

  if (!code || !problemId) {
    return res.status(400).json({ error: "Missing code or problem ID" });
  }

  if (code.length > 100000) {
    return res.status(400).json({ error: "Code size too large (max 100KB)" });
  }

  try {
    checkSubmitRateLimit(clientIP);

    // Get test cases from server
    let testCases;
    try {
      const response = await axios.post(
        `${process.env.SERVER_BASE_URL || 'http://localhost:5050'}/api/problems/${problemId}/test-cases`,
        {}, 
        {
          headers: {
            'Authorization': authHeader || '',
            'Content-Type': 'application/json',
            'X-Service': 'compiler'
          },
          timeout: 5000
        }
      );
      testCases = response.data.testCases;
    } catch (serverError) {
      console.error("Failed to fetch test cases:", serverError.message);
      return res.status(404).json({ 
        error: "Test cases not available", 
        message: "Unable to fetch test cases for evaluation"
      });
    }

    if (!testCases || testCases.length === 0) {
      return res.status(404).json({ 
        error: "No test cases found",
        message: "This problem doesn't have test cases configured"
      });
    }

    const filepath = await generateFile(language, code);
    let passedCount = 0;
    let totalCount = testCases.length;
    let executablePath = "";
    let totalExecutionTime = 0;
    let overallStatus = "Accepted";

    // Compile once for C/C++
    try {
      if (language === "cpp") executablePath = compileCpp(filepath);
      else if (language === "c") executablePath = compileC(filepath);
    } catch (compileError) {
      overallStatus = "Compilation Error";
      
      // Save compilation error to server
      if (userId) {
        try {
          await axios.post(
            `${process.env.SERVER_BASE_URL || 'http://localhost:5050'}/api/submissions`,
            {
              userId,
              problemId,
              code,
              language,
              status: overallStatus,
              runtime: "0ms",
              testCasesPassed: 0,
              totalTestCases: totalCount
            },
            {
              headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
              }
            }
          );
        } catch (saveError) {
          console.log("failed");
          console.error("Failed to save compilation error:", saveError.message);
        }
      }

      // Cleanup
      try {
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }

      return res.status(400).json({
        error: "Compilation Error",
        message: compileError.message,
        passedAll: false,
        overallStatus,
        totalExecutionTime: "0ms",
        testCasesPassed: 0,
        totalTestCases: totalCount
      });
    }

    // Run test cases
    for (let i = 0; i < testCases.length; i++) {
      const test = testCases[i];
      const testStartTime = Date.now();
      
      try {
        let output = "";
        const timeLimit = 2000;

        switch (language) {
          case "cpp":
            output = await runCpp(executablePath, test.input, timeLimit);
            break;
          case "c":
            output = await runC(executablePath, test.input, timeLimit);
            break;
          case "python":
            output = await runPython(filepath, test.input, timeLimit);
            break;
          case "java":
            output = await runJavaDirect(filepath, test.input, timeLimit);
            break;
          default:
            throw new Error("Unsupported language");
        }

        const testExecutionTime = Date.now() - testStartTime;
        totalExecutionTime += testExecutionTime;

        const actual = output.trim();
        const expected = test.output.trim();
        const passed = actual === expected;

        if (passed) {
          passedCount++;
        } else if (overallStatus === "Accepted") {
          overallStatus = "Wrong Answer";
        }

      } catch (err) {
        const testExecutionTime = Date.now() - testStartTime;
        totalExecutionTime += testExecutionTime;

        if (err.message.includes("Time Limit Exceeded") && overallStatus === "Accepted") {
          overallStatus = "Time Limit Exceeded";
        } else if (err.message.includes("Memory Limit Exceeded") && overallStatus === "Accepted") {
          overallStatus = "Memory Limit Exceeded";
        } else if (overallStatus === "Accepted") {
          overallStatus = "Runtime Error";
        }

        // Stop on critical errors
        if (err.message.includes("Time Limit Exceeded") && i > 0) {
          console.log(`Stopping execution after ${i + 1} test cases due to TLE`);
          totalCount = i + 1; // Update total count to actual tests run
          break;
        }
      }
    }

    // Cleanup files
    try {
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      if (executablePath && fs.existsSync(executablePath)) fs.unlinkSync(executablePath);
    } catch (cleanupError) {
      console.error("File cleanup error:", cleanupError);
    }

    const passedAll = passedCount === totalCount;
    if (!passedAll && overallStatus === "Accepted") {
      overallStatus = "Wrong Answer";
    }

    // Save submission to server
    if (userId) {
      try {
        await axios.post(
          `${process.env.SERVER_BASE_URL || 'http://localhost:5050'}/api/submissions`,
          {
            userId,
            problemId,
            code,
            language,
            status: overallStatus,
            runtime: `${totalExecutionTime}ms`,
            testCasesPassed: passedCount,
            totalTestCases: totalCount
          },
          {
            headers: {
              'Authorization': authHeader || '',
              'Content-Type': 'application/json'
            }
          }
        );
        console.log(`Submission saved: ${overallStatus} - ${passedCount}/${totalCount} tests passed`);
      } catch (serverError) {
        console.error("Failed to save submission:", serverError.response?.data || serverError.message);
        // Continue even if saving fails
      }
    }

    // SECURE RESPONSE: Only return summary, no test case details
    res.json({ 
      passedAll,
      overallStatus,
      totalExecutionTime: `${totalExecutionTime}ms`,
      testCasesPassed: passedCount,
      totalTestCases: totalCount,
      language,
      problemId,
      message: passedAll ? 
        "🎉 All test cases passed!" : 
        `❌ ${passedCount}/${totalCount} test cases passed`
    });

  } catch (err) {
    console.error("Submission error:", err);
    
    // Cleanup on error
    try {
      const codesDir = path.join(__dirname, "../utils/codes");
      const outputsDir = path.join(__dirname, "../utils/outputs");
      
      [codesDir, outputsDir].forEach(dir => {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          const now = Date.now();
          files.forEach(file => {
            const filePath = path.join(dir, file);
            try {
              const stats = fs.statSync(filePath);
              if (now - stats.mtime.getTime() > 1800000) {
                fs.unlinkSync(filePath);
              }
            } catch (e) {
              // File might have been deleted already
            }
          });
        }
      });
    } catch (cleanupError) {
      console.error("Cleanup error:", cleanupError);
    }

    if (err.message.includes("rate limit")) {
      return res.status(429).json({ error: err.message });
    }

    res.status(500).json({ 
      error: "Submission failed", 
      message: "Internal server error",
      passedAll: false
    });
  }
});

module.exports = router;