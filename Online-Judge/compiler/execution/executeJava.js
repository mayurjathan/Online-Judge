const { exec } = require("child_process");
const path = require("path");
const { outputDir } = require("../utils/paths");

const executeJava = (filepath) => {
  return new Promise((resolve, reject) => {
    const jobId = path.basename(filepath).split(".")[0];
    const outputFile = path.join(outputDir, `${jobId}.out`);

    exec(`java ${filepath}`, (error, stdout, stderr) => {
      if (error) return reject(stderr || error.message);

      require("fs").writeFileSync(outputFile, stdout);
      resolve(stdout);
    });
  });
};

module.exports = executeJava;
