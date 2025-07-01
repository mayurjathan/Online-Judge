const { exec } = require("child_process");
const path = require("path");

const executePython = (filepath, inputPath) => {
  return new Promise((resolve, reject) => {
    const command = `python3 ${filepath} < ${inputPath || "/dev/null"}`;
    exec(command, (error, stdout, stderr) => {
      if (error) return reject({ error, stderr });
      if (stderr) return reject({ stderr });
      resolve(stdout);
    });
  });
};

module.exports = executePython;
