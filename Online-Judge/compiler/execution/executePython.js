const { spawn } = require("child_process");
const fs = require("fs");

// Restricted Python modules for security
const RESTRICTED_IMPORTS = [
  'os', 'subprocess', 'sys', 'socket', 'urllib', 'requests',
  'shutil', 'glob', 'pickle', 'eval', 'exec', 'open',
  '__import__', 'compile', 'file', 'input', 'raw_input'
];

const validatePythonCode = (code) => {
  // Check for restricted imports and functions
  for (const restricted of RESTRICTED_IMPORTS) {
    if (code.includes(restricted)) {
      throw new Error(`Restricted module/function detected: ${restricted}`);
    }
  }
  
  // Check for file operations
  const fileOps = ['open(', 'file(', 'with open'];
  for (const op of fileOps) {
    if (code.includes(op)) {
      throw new Error("File operations are not allowed");
    }
  }
  
  // Check for infinite loop patterns
  const infinitePatterns = [
    /while\s+True\s*:/,
    /while\s+1\s*:/,
    /for.*in.*range\s*\(\s*10\s*\*\*\s*[6-9]/
  ];
  
  for (const pattern of infinitePatterns) {
    if (pattern.test(code)) {
      throw new Error("Potentially infinite loop detected");
    }
  }
};

const runPython = (filepath, inputStr = "", timeLimit = 5000) => {
  return new Promise((resolve, reject) => {
    // Read and validate code
    try {
      const code = fs.readFileSync(filepath, 'utf8');
      validatePythonCode(code);
    } catch (error) {
      return reject(error);
    }
    
    // Create secure wrapper script
    const secureCode = `
import signal
import sys
import resource

# Set resource limits
resource.setrlimit(resource.RLIMIT_CPU, (5, 5))  # 5 seconds CPU time
resource.setrlimit(resource.RLIMIT_AS, (256*1024*1024, 256*1024*1024))  # 256MB memory

def timeout_handler(signum, frame):
    raise TimeoutError("Time Limit Exceeded")

signal.signal(signal.SIGALRM, timeout_handler)
signal.alarm(${Math.ceil(timeLimit/1000)})  # Set alarm

try:
    exec(open('${filepath}').read())
except TimeoutError:
    print("Time Limit Exceeded", file=sys.stderr)
    sys.exit(1)
except MemoryError:
    print("Memory Limit Exceeded", file=sys.stderr)
    sys.exit(1)
except Exception as e:
    print(f"Runtime Error: {e}", file=sys.stderr)
    sys.exit(1)
finally:
    signal.alarm(0)
`;

    const process = spawn('python3', ['-c', secureCode], {
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
    
    // Write input
    if (inputStr) {
      if (inputStr.length > 10000) {
        clearTimeout(timeoutId);
        process.kill('SIGKILL');
        return reject(new Error("Input size too large"));
      }
      
      try {
        process.stdin.write(inputStr);
        process.stdin.end();
      } catch (e) {
        clearTimeout(timeoutId);
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
        
        if (signal === 'SIGKILL') {
          reject(new Error("Process killed - possible infinite loop"));
        } else if (code === 0) {
          resolve(output);
        } else {
          if (error.includes("Time Limit Exceeded")) {
            reject(new Error("Time Limit Exceeded"));
          } else if (error.includes("Memory Limit Exceeded")) {
            reject(new Error("Memory Limit Exceeded"));
          } else {
            reject(new Error(error || `Runtime Error: Process exited with code ${code}`));
          }
        }
      }
    });
    
    process.on("error", (err) => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeoutId);
        reject(new Error(`Execution Error: ${err.message}`));
      }
    });
  });
};

module.exports = { runPython };