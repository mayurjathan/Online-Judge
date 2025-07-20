// server/models/Submission.js
const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false // 🔧 changed from true to false
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
    enum: [
      "Accepted",
      "Wrong Answer",
      "Time Limit Exceeded",
      "Memory Limit Exceeded",
      "Runtime Error",
      "Compilation Error"
    ]
  },
  runtime: {
    type: String,
    default: "0ms"
  },
  memory: {
    type: String,
    default: "N/A"
  },
  testCasesPassed: {
    type: Number,
    default: 0
  },
  totalTestCases: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

submissionSchema.index({ userId: 1, problemId: 1, createdAt: -1 });
submissionSchema.index({ problemId: 1, status: 1 });
submissionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Submission", submissionSchema);
