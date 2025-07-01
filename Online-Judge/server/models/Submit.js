const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
  code: String,
  language: String,
  result: String, // "Passed", "Failed", "Error"
  testResults: [
    {
      input: String,
      expectedOutput: String,
      actualOutput: String,
      passed: Boolean,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Submission", submissionSchema);
