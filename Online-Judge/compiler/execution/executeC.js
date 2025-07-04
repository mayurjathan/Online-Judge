const { execSync, spawn } = require("child_process");
const path = require("path");
const { v4: uuid } = require("uuid");
const fs = require("fs");

const outputPath = path.join(__dirname, "../utils/outputs");
if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true });

const compileC = (filepath) => {
  const jobId = uuid();
  const outPath = path.join(outputPath, `${jobId}.out`);
  execSync(`gcc ${filepath} -o ${outPath}`, { timeout: 5000 });
  return outPath;
};

const runC = (executablePath, inputStr = "") => {
  return new Promise((resolve, reject) => {
    const process = spawn(executablePath);
    let output = "", error = "";

    process.stdin.write(inputStr);
    process.stdin.end();

    process.stdout.on("data", data => output += data.toString());
    process.stderr.on("data", data => error += data.toString());

    process.on("close", code => {
      if (code === 0) resolve(output);
      else reject(error || `Exited with code ${code}`);
    });
  });
};

module.exports = { compileC, runC };
