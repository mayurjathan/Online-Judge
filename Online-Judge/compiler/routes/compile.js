const express = require("express");
const router = express.Router();

const generateFile = require("../utils/generateFile");
const generateInputFile = require("../utils/generateInputFile");

const { compileCpp, runCpp } = require("../execution/executeCpp");
const { compileC, runC } = require("../execution/executeC");
const { runPython } = require("../execution/executePython");
const { runJavaDirect } = require("../execution/executeJava");

const path = require("path");
const fs = require("fs");

// Rate limiting map (in production, use Redis or proper rate limiting)
const rateLimitMap = new Map();

const checkRateLimit = (ip) => {
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];
  
  // Remove requests older than 1 minute
  const recentRequests = userRequests.filter(time => now - time < 60000);
  
  if (recentRequests.length >= 10) { // Max 10 requests per minute
    throw new Error("Rate limit exceeded. Please try again later.");
  }
  
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
};

router.post("/run", async (req, res) => {
  const { language = "cpp", code, input = "" } = req.body;
  const clientIP = req.ip || req.connection.remoteAddress;

  // Basic validation
  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  if (code.length > 100000) { // 100KB code limit
    return res.status(400).json({ error: "Code size too large (max 100KB)" });
  }

  try {
    // Rate limiting
    checkRateLimit(clientIP);

    const filepath = await generateFile(language, code);
    let output = "";
    let executionTime = Date.now();

    // Language-specific execution with time limits
    switch (language) {
      case "cpp":
        try {
          const executablePath = compileCpp(filepath);
          output = await runCpp(executablePath, input, 5000); // 5 second timeout
          
          // Cleanup executable
          if (fs.existsSync(executablePath)) {
            fs.unlinkSync(executablePath);
          }
        } catch (error) {
          if (error.message.includes("Time Limit Exceeded")) {
            return res.status(408).json({ 
              error: "Time Limit Exceeded", 
              message: "Your code took too long to execute (>5 seconds)" 
            });
          } else if (error.message.includes("Memory Limit Exceeded")) {
            return res.status(413).json({ 
              error: "Memory Limit Exceeded", 
              message: "Your code used too much memory (>256MB)" 
            });
          } else if (error.message.includes("Compilation Error")) {
            return res.status(400).json({ 
              error: "Compilation Error", 
              message: error.message 
            });
          } else {
            throw error;
          }
        }
        break;

      case "c":
        try {
          const executablePath = compileC(filepath);
          output = await runC(executablePath, input, 5000);
          
          // Cleanup executable
          if (fs.existsSync(executablePath)) {
            fs.unlinkSync(executablePath);
          }
        } catch (error) {
          if (error.message.includes("Time Limit Exceeded")) {
            return res.status(408).json({ 
              error: "Time Limit Exceeded", 
              message: "Your code took too long to execute (>5 seconds)" 
            });
          } else if (error.message.includes("Memory Limit Exceeded")) {
            return res.status(413).json({ 
              error: "Memory Limit Exceeded", 
              message: "Your code used too much memory (>256MB)" 
            });
          } else if (error.message.includes("Compilation Error")) {
            return res.status(400).json({ 
              error: "Compilation Error", 
              message: error.message 
            });
          } else {
            throw error;
          }
        }
        break;

      case "python":
        try {
          output = await runPython(filepath, input, 5000);
        } catch (error) {
          if (error.message.includes("Time Limit Exceeded")) {
            return res.status(408).json({ 
              error: "Time Limit Exceeded", 
              message: "Your code took too long to execute (>5 seconds)" 
            });
          } else if (error.message.includes("Memory Limit Exceeded")) {
            return res.status(413).json({ 
              error: "Memory Limit Exceeded", 
              message: "Your code used too much memory (>256MB)" 
            });
          } else if (error.message.includes("Restricted")) {
            return res.status(403).json({ 
              error: "Security Error", 
              message: error.message 
            });
          } else {
            throw error;
          }
        }
        break;

      case "java":
        try {
          output = await runJavaDirect(filepath, input, 5000);
        } catch (error) {
          if (error.message.includes("Time Limit Exceeded")) {
            return res.status(408).json({ 
              error: "Time Limit Exceeded", 
              message: "Your code took too long to execute (>5 seconds)" 
            });
          } else if (error.message.includes("Memory Limit Exceeded")) {
            return res.status(413).json({ 
              error: "Memory Limit Exceeded", 
              message: "Your code used too much memory (>256MB)" 
            });
          } else if (error.message.includes("Compilation Error")) {
            return res.status(400).json({ 
              error: "Compilation Error", 
              message: error.message 
            });
          } else if (error.message.includes("Restricted")) {
            return res.status(403).json({ 
              error: "Security Error", 
              message: error.message 
            });
          } else {
            throw error;
          }
        }
        break;

      default:
        return res.status(400).json({ error: "Unsupported language" });
    }

    executionTime = Date.now() - executionTime;

    // Cleanup source file
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    return res.json({ 
      output: output || "No output generated",
      executionTime: `${executionTime}ms`,
      language,
      status: "Success"
    });

  } catch (err) {
    console.error("Run error:", err);
    
    // Cleanup any files that might have been created
    try {
      const codesDir = path.join(__dirname, "../utils/codes");
      const outputsDir = path.join(__dirname, "../utils/outputs");
      
      // Clean up temporary files older than 1 hour
      [codesDir, outputsDir].forEach(dir => {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          const now = Date.now();
          files.forEach(file => {
            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);
            if (now - stats.mtime.getTime() > 3600000) { // 1 hour
              fs.unlinkSync(filePath);
            }
          });
        }
      });
    } catch (cleanupError) {
      console.error("Cleanup error:", cleanupError);
    }

    if (err.message.includes("Rate limit exceeded")) {
      return res.status(429).json({ error: err.message });
    }

    return res.status(500).json({ 
      error: "Execution failed", 
      message: err.message || "Internal server error",
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

module.exports = router;