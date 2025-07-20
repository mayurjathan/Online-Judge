const { execSync, spawn } = require("child_process");
const path = require("path");
const { v4: uuid } = require("uuid");
const fs = require("fs");

const outputPath = path.join(__dirname, "../utils/outputs");
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const compileC = (filepath) => {
  const jobId = uuid();
  const outPath = path.join(outputPath, `${jobId}.out`);
  
  try {
    // Add security flags and disable file operations
    execSync(`gcc -std=c11 -O2 -Wall -Wextra -DONLINE_JUDGE -DSECURE_MODE ${filepath} -o ${outPath}`, { 
      timeout: 10000 // 10 second compile timeout
    });
    return outPath;
  } catch (error) {
    throw new Error(`Compilation Error: ${error.message}`);
  }
};

const runC = (executablePath, inputStr = "", timeLimit = 5000) => {
  return new Promise((resolve, reject) => {
    const process = spawn(executablePath, [], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: timeLimit,
      killSignal: 'SIGKILL'
    });
    
    let output = "";
    let error = "";
    let isResolved = false;
    
    // Set up timeout
    const timeoutId = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        process.kill('SIGKILL');
        reject(new Error("Time Limit Exceeded"));
      }
    }, timeLimit);
    
    // Memory limit check (approximate)
    let memoryCheckInterval;
    if (process.pid) {
      memoryCheckInterval = setInterval(() => {
        try {
          const memInfo = execSync(`ps -o rss= -p ${process.pid}`, { encoding: 'utf8', timeout: 1000 });
          const memoryKB = parseInt(memInfo.trim());
          if (memoryKB > 256000) { // 256MB limit
            if (!isResolved) {
              isResolved = true;
              clearTimeout(timeoutId);
              clearInterval(memoryCheckInterval);
              process.kill('SIGKILL');
              reject(new Error("Memory Limit Exceeded"));
            }
          }
        } catch (e) {
          // Process might have ended, ignore
        }
      }, 100);
    }
    
    // Write input with size limit
    if (inputStr) {
      if (inputStr.length > 10000) { // 10KB input limit
        clearTimeout(timeoutId);
        if (memoryCheckInterval) clearInterval(memoryCheckInterval);
        process.kill('SIGKILL');
        return reject(new Error("Input size too large"));
      }
      
      try {
        process.stdin.write(inputStr);
        process.stdin.end();
      } catch (e) {
        clearTimeout(timeoutId);
        if (memoryCheckInterval) clearInterval(memoryCheckInterval);
        return reject(new Error("Failed to write input"));
      }
    } else {
      process.stdin.end();
    }
    
    // Handle output with size limit
    process.stdout.on("data", (data) => {
      output += data.toString();
      if (output.length > 50000) { // 50KB output limit
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeoutId);
          if (memoryCheckInterval) clearInterval(memoryCheckInterval);
          process.kill('SIGKILL');
          reject(new Error("Output size limit exceeded"));
        }
      }
    });
    
    process.stderr.on("data", (data) => {
      error += data.toString();
      if (error.length > 10000) { // 10KB error limit
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeoutId);
          if (memoryCheckInterval) clearInterval(memoryCheckInterval);
          process.kill('SIGKILL');
          reject(new Error("Error output too large"));
        }
      }
    });
    
    process.on("close", (code, signal) => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeoutId);
        if (memoryCheckInterval) clearInterval(memoryCheckInterval);
        
        if (signal === 'SIGKILL') {
          reject(new Error("Process killed - possible infinite loop or timeout"));
        } else if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(error || `Runtime Error: Process exited with code ${code}`));
        }
      }
    });
    
    process.on("error", (err) => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeoutId);
        if (memoryCheckInterval) clearInterval(memoryCheckInterval);
        reject(new Error(`Execution Error: ${err.message}`));
      }
    });
  });
};

module.exports = { compileC, runC };