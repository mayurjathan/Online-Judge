const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
  title: String,
  description: String,
  difficulty: String,
  examples: [
    {
      input: String,
      output: String,
      explanation: String,
    },
  ],
  constraints: [String],
  visibleTestCases: [
    {
      input: String,
      output: String,
    },
  ],
  hiddenTestCases: [
    {
      input: String,
      output: String,
    },
  ],
}, { collection: "problems" }); 

module.exports = mongoose.model("Problem", problemSchema);
