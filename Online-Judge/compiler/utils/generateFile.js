const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const dirCodes = path.join(__dirname, "codes");

if (!fs.existsSync(dirCodes)) {
  fs.mkdirSync(dirCodes, { recursive: true });
}

const generateFile = async (language, code) => {
  const extMap = {
    cpp: "cpp",
    c: "c",
    python: "py",
    java: "java",
  };
    const jobId = uuid();
  const fileName = `${jobId}.${language}`;
  const filePath = path.join(dirCodes, fileName);
  let finalCode = code;

  if (language === "java") {
    finalCode = code.replace(/public\s+class\s+Main/, `public class ${jobId}`);
  }

  await fs.promises.writeFile(filePath, code);
  return filePath;
};

module.exports = generateFile;
