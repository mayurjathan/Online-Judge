const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ["cpp", "c", "python", "java"]
  },
  status: {
    type: String,
    required: true,
    enum: ["Accepted", "Wrong Answer", "Time Limit Exceeded", "Runtime Error", "Compilation Error"]
  },
  runtime: String,
  memory: String,
  testCasesPassed: Number,
  totalTestCases: Number
}, { 
  timestamps: true 
});

module.exports = mongoose.model("Submission", submissionSchema);