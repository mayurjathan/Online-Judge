const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const dirCodes = path.join(__dirname, "codes");
if (!fs.existsSync(dirCodes)) {
  fs.mkdirSync(dirCodes, { recursive: true });
}

const forbiddenPatterns = [
  "#include <filesystem>",
  "#include <dirent.h>",
  "system(",
  "import os",
  "import sys",
  "__import__",
  "Runtime.getRuntime()",
  "ProcessBuilder"
];

const generateFile = async (language, code) => {
  // 🚫 Check for forbidden code
  for (const pattern of forbiddenPatterns) {
    if (code.includes(pattern)) {
      throw new Error(`Usage of forbidden construct: ${pattern}`);
    }
  }

  const jobId = uuid();
  let filename;

  switch (language) {
    case "cpp":
      filename = `${jobId}.cpp`;
      break;
    case "c":
      filename = `${jobId}.c`;
      break;
    case "python":
      filename = `${jobId}.py`;
      break;
    case "java":
      filename = `${jobId}.java`;
      // Replace public class to class (if user keeps wrong class name)
      code = code.replace(/public\\s+class/g, "class");
      break;
    default:
      throw new Error("Unsupported language");
  }

  const filepath = path.join(dirCodes, filename);
  await fs.promises.writeFile(filepath, code);
  return filepath;
};

module.exports = generateFile;
