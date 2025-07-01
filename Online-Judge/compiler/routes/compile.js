const express = require("express");
const router = express.Router();
const generateFile = require("../utils/generateFile");
const generateInputFile = require("../utils/generateInputFile");
const executeCpp = require("../execution/executeCpp");
const executeC = require("../execution/executeC");
const executePython = require("../execution/executePython");
const executeJava = require("../execution/executeJava");

router.post("/", async (req, res) => {
  const { language, code, input = "" } = req.body;

  try {
    const filepath = await generateFile(language, code);
    const inputPath = await generateInputFile(input);

    let output;
    switch (language) {
      case "cpp":
        output = await executeCpp(filepath, inputPath);
        break;
      case "c":
        output = await executeC(filepath, inputPath);
        break;
      case "python":
        output = await executePython(filepath, inputPath);
        break;
      case "java":
        output = await executeJava(filepath, inputPath);
        break;
      default:
        return res.status(400).json({ error: "Unsupported language" });
    }

    return res.json({ output });
  } catch (err) {
    return res.status(500).json({ stderr: err.message });
  }
});

module.exports = router;
