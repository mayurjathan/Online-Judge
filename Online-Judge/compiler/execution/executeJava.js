const { exec } = require("child_process");
const path = require("path");

const executeJava = (filepath, inputPath) => {
  return new Promise((resolve, reject) => {
    const command = `java ${filepath} < ${inputPath || "/dev/null"}`;
    exec(command, (error, stdout, stderr) => {
      if (error) return reject({ error, stderr });
      if (stderr) return reject({ stderr });
      resolve(stdout);
    });
  });
};

module.exports = executeJava;
