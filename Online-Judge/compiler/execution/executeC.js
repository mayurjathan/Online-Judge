// compiler/execution/executeC.js
const { exec } = require("child_process");
const path = require("path");

const executeC = (filepath, inputPath) => {
  const jobId = path.basename(filepath).split(".")[0];
  const outPath = path.join(__dirname, `../utils/outputs/${jobId}.out`);

  return new Promise((resolve, reject) => {
    const command = `gcc ${filepath} -o ${outPath} && ${outPath} < ${inputPath || "/dev/null"}`;
    exec(command, (error, stdout, stderr) => {
      if (error) return reject({ error, stderr });
      if (stderr) return reject({ stderr });
      resolve(stdout);
    });
  });
};

module.exports = executeC;
