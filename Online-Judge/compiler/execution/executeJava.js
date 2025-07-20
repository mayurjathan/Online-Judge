const { execSync, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { v4: uuid } = require("uuid");

const outputPath = path.join(__dirname, "../utils/outputs");
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const validateJavaCode = (code) => {
  // Check for restricted operations
  const restrictedOps = [
    'System.exit', 'Runtime.getRuntime', 'ProcessBuilder',
    'File', 'FileInputStream', 'FileOutputStream', 'FileWriter', 'FileReader',
    'java.io.File', 'java.lang.Runtime', 'java.lang.Process',
    'Socket', 'ServerSocket', 'URL', 'URLConnection',
    'Thread.sleep', 'while(true)', 'for(;;)'
  ];
  
  for (const restricted of restrictedOps) {
    if (code.includes(restricted)) {
      throw new Error(`Restricted operation detected: ${restricted}`);
    }
  }
  
  // Check for infinite loop patterns
  if (/while\s*\(\s*true\s*\)/.test(code) || /for\s*\(\s*;\s*;\s*\)/.test(code)) {
    throw new Error("Potentially infinite loop detected");
  }
};

const compileJava = (filepath) => {
  const jobId = uuid();
  const dir = path.dirname(filepath);
  
  try {
    // Read and validate code
    const code = fs.readFileSync(filepath, 'utf8');
    validateJavaCode(code);
    
    // Compile with security restrictions
    execSync(`javac -cp . ${filepath}`, { 
      cwd: dir,
      timeout: 10000 // 10 second compile timeout
    });
    
    return { dir, jobId };
  } catch (error) {
    throw new Error(`Compilation Error: ${error.message}`);
  }
};

const runJava = (compiledInfo, inputStr = "", timeLimit = 5000) => {
  return new Promise((resolve, reject) => {
    const { dir } = compiledInfo;
    
    // Find the main class
    const javaFiles = fs.readdirSync(dir).filter(f => f.endsWith('.class'));
    if (javaFiles.length === 0) {
      return reject(new Error("No compiled class files found"));
    }
    
    const mainClass = javaFiles[0].replace('.class', '');
    
    // Run with security manager and resource limits
    const process = spawn('java', [
      '-Xmx256m', // Max heap size 256MB
      '-Xss1m',   // Stack size 1MB
      '-Djava.security.manager',
      '-Djava.security.policy==' + path.join(__dirname, 'java.policy'),
      '-cp', dir,
      mainClass
    ], {
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
    
    // Memory monitoring
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
    
    // Write input
    if (inputStr) {
      if (inputStr.length > 10000) {
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
    
    // Handle output
    process.stdout.on("data", (data) => {
      output += data.toString();
      if (output.length > 50000) {
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

const runJavaDirect = async (filepath, inputStr = "", timeLimit = 5000) => {
  try {
    const compiledInfo = compileJava(filepath);
    return await runJava(compiledInfo, inputStr, timeLimit);
  } catch (error) {
    throw error;
  }
};

module.exports = { compileJava, runJava, runJavaDirect };