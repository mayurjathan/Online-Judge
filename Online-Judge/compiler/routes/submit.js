const express = require("express");
const router = express.Router();
const axios = require("axios");
const fs = require("fs");
const crypto = require("crypto");

const generateFile = require("../utils/generateFile");
const { compileCpp, runCpp } = require("../execution/executeCpp");
const { compileC, runC } = require("../execution/executeC");
const { runPython } = require("../execution/executePython");
const { runJavaDirect } = require("../execution/executeJava");

// Rate limiting
const submitRateLimit = new Map();

const checkRateLimit = (ip) => {
  const now = Date.now();
  const userSubmissions = submitRateLimit.get(ip) || [];
  const recent = userSubmissions.filter(time => now - time < 300000);
  
  if (recent.length >= 5) {
    throw new Error("Rate limit exceeded. Try again later.");
  }
  
  recent.push(now);
  submitRateLimit.set(ip, recent);
};

// Fetch only inputs and output hashes (not actual expected outputs)
const fetchSecureTestCases = async (problemId, authHeader) => {
  const response = await axios.post(
  `${process.env.SERVER_BASE_URL}/api/problems/${problemId}/secure-test-cases`,
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
  return response.data.testCases;
};

// Verify output with backend using hash comparison
const verifyOutput = async (problemId, testIndex, actualOutput, authHeader) => {
  const response = await axios.post(
    `${process.env.SERVER_BASE_URL}/api/problems/${problemId}/verify-output`,
    {
      testIndex,
      actualOutput: actualOutput.trim()
    },
    {
      headers: {
        'Authorization': authHeader || '',
        'Content-Type': 'application/json',
        'X-Service': 'compiler'
      },
      timeout: 5000
    }
  );
  return response.data.isCorrect;
};

const saveSubmission = async (submissionData, authHeader) => {
  console.log("💾 Attempting to save submission:", {
    userId: submissionData.userId,
    problemId: submissionData.problemId,
    status: submissionData.status,
    language: submissionData.language
  });
  
  const response = await axios.post(
    `${process.env.SERVER_BASE_URL}/api/submissions`,
    submissionData,
    {
      headers: {
        'Authorization': authHeader || '',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    }
  );
  
  console.log("✅ Submission saved successfully:", response.data);
  return response.data;
};

const runTestCase = async (language, filepath, executablePath, input, timeLimit = 2000) => {
  switch (language) {
    case "cpp":
      return await runCpp(executablePath, input, timeLimit);
    case "c":
      return await runC(executablePath, input, timeLimit);
    case "python":
      return await runPython(filepath, input, timeLimit);
    case "java":
      return await runJavaDirect(filepath, input, timeLimit);
    default:
      throw new Error("Unsupported language");
  }
};

router.post("/submit", async (req, res) => {
  const { code, language = "cpp", problemId, userId } = req.body;
  const clientIP = req.ip || req.connection.remoteAddress;
  const authHeader = req.headers.authorization;

  if (!code || !problemId) {
    return res.status(400).json({ error: "Missing code or problem ID" });
  }

  if (code.length > 100000) {
    return res.status(400).json({ error: "Code size too large (max 100KB)" });
  }

  let filepath = null;
  let executablePath = null;

  try {
    checkRateLimit(clientIP);

    // Get test cases (only inputs, no expected outputs)
    const secureTestCases = await fetchSecureTestCases(problemId, authHeader);
    if (!secureTestCases?.length) {
      return res.status(404).json({ error: "No test cases found" });
    }

    // Generate and compile code
    filepath = await generateFile(language, code);
    
    if (language === "cpp") {
      executablePath = compileCpp(filepath);
    } else if (language === "c") {
      executablePath = compileC(filepath);
    }

    // Run test cases and verify with backend
    let passedCount = 0;
    let totalExecutionTime = 0;
    let overallStatus = "Accepted";

    for (let i = 0; i < secureTestCases.length; i++) {
      const test = secureTestCases[i];
      const startTime = Date.now();
      
      try {
        const output = await runTestCase(language, filepath, executablePath, test.input);
        totalExecutionTime += Date.now() - startTime;

        // Verify output with backend (backend compares against actual expected output)
        const isCorrect = await verifyOutput(problemId, i, output, authHeader);
        
        if (isCorrect) {
          passedCount++;
        } else if (overallStatus === "Accepted") {
          overallStatus = "Wrong Answer";
        }
      } catch (err) {
        totalExecutionTime += Date.now() - startTime;
        
        if (err.message.includes("Time Limit Exceeded")) {
          overallStatus = "Time Limit Exceeded";
        } else if (err.message.includes("Memory Limit Exceeded")) {
          overallStatus = "Memory Limit Exceeded";
        } else if (overallStatus === "Accepted") {
          overallStatus = "Runtime Error";
        }
      }
    }

    const passedAll = passedCount === secureTestCases.length;
    
    // Save submission
    if (userId) {
      console.log("🔍 User ID found, attempting to save submission...");
      try {
        await saveSubmission({
          userId,
          problemId,
          code,
          language,
          status: overallStatus,
          runtime: `${totalExecutionTime}ms`,
          testCasesPassed: passedCount,
          totalTestCases: secureTestCases.length
        }, authHeader);
      } catch (saveError) {
        console.error("❌ Failed to save submission:", saveError.response?.data || saveError.message);
      }
    } else {
      console.log("⚠️ No user ID found, skipping submission save");
    }

    return res.json({
      passedAll,
      overallStatus,
      totalExecutionTime: `${totalExecutionTime}ms`,
      testCasesPassed: passedCount,
      totalTestCases: secureTestCases.length,
      message: passedAll ? 
        "🎉 All test cases passed!" : 
        `❌ ${passedCount}/${secureTestCases.length} test cases passed`
    });

  } catch (err) {
    console.error("Submission error:", err);
    
    // Handle specific errors
    if (err.message.includes("Compilation Error")) {
      if (userId) {
        console.log("🔍 Compilation error - attempting to save submission...");
        try {
          await saveSubmission({
            userId,
            problemId,
            code,
            language,
            status: "Compilation Error",
            runtime: "0ms",
            testCasesPassed: 0,
            totalTestCases: 0
          }, authHeader);
        } catch (saveError) {
          console.error("❌ Failed to save compilation error:", saveError.response?.data || saveError.message);
        }
      }
      
      return res.status(400).json({
        error: "Compilation Error",
        message: err.message,
        passedAll: false
      });
    }

    if (err.message.includes("rate limit")) {
      return res.status(429).json({ error: err.message });
    }

    if (err.response?.status === 404) {
      return res.status(404).json({ error: "Test cases not available" });
    }

    return res.status(500).json({ 
      error: "Submission failed",
      passedAll: false
    });

  } finally {
    // Cleanup
    try {
      if (filepath && fs.existsSync(filepath)) fs.unlinkSync(filepath);
      if (executablePath && fs.existsSync(executablePath)) fs.unlinkSync(executablePath);
    } catch {}
  }
});

module.exports = router;