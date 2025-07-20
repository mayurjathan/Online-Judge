// server/models/Submission.js
const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Allow anonymous submissions
    index: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true,
    index: true
  },
  code: {
    type: String,
    required: true,
    maxLength: 100000 // 100KB limit
  },
  language: {
    type: String,
    required: true,
    enum: ["cpp", "c", "python", "java"],
    index: true
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
    ],
    index: true
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
    default: 0,
    min: 0
  },
  totalTestCases: {
    type: Number,
    default: 0,
    min: 0
  },
  executionTime: {
    type: Number, // in milliseconds
    default: 0
  },
  // Additional metadata
  submissionIP: {
    type: String,
    default: ""
  },
  submissionSource: {
    type: String,
    enum: ["web", "api", "compiler"],
    default: "compiler"
  }
}, { 
  timestamps: true,
  // Add indexes for better query performance
  index: [
    { userId: 1, problemId: 1, createdAt: -1 },
    { problemId: 1, status: 1 },
    { userId: 1, createdAt: -1 },
    { status: 1, createdAt: -1 },
    { userId: 1, status: 1, problemId: 1 }
  ]
});

// Compound indexes for common queries
submissionSchema.index({ userId: 1, problemId: 1, createdAt: -1 });
submissionSchema.index({ problemId: 1, status: 1 });
submissionSchema.index({ userId: 1, createdAt: -1 });
submissionSchema.index({ createdAt: -1 });

// Virtual for accuracy calculation
submissionSchema.virtual('isAccepted').get(function() {
  return this.status === 'Accepted';
});

// Virtual for execution time in readable format
submissionSchema.virtual('formattedRuntime').get(function() {
  if (this.executionTime) {
    return `${this.executionTime}ms`;
  }
  return this.runtime || '0ms';
});

// Instance method to check if submission passed
submissionSchema.methods.isPassed = function() {
  return this.status === 'Accepted';
};

// Instance method to get pass rate
submissionSchema.methods.getPassRate = function() {
  if (this.totalTestCases === 0) return 0;
  return Math.round((this.testCasesPassed / this.totalTestCases) * 100);
};

// Static method to get user's submission stats
submissionSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalSubmissions: { $sum: 1 },
        acceptedSubmissions: {
          $sum: { $cond: [{ $eq: ["$status", "Accepted"] }, 1, 0] }
        },
        languages: { $addToSet: "$language" },
        recentSubmission: { $max: "$createdAt" },
        avgExecutionTime: { $avg: "$executionTime" }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      accuracy: 0,
      languages: [],
      recentSubmission: null,
      avgExecutionTime: 0
    };
  }

  const result = stats[0];
  result.accuracy = result.totalSubmissions > 0 ? 
    Math.round((result.acceptedSubmissions / result.totalSubmissions) * 100) : 0;

  return result;
};

// Static method to get problem stats
submissionSchema.statics.getProblemStats = async function(problemId) {
  const stats = await this.aggregate([
    { $match: { problemId: new mongoose.Types.ObjectId(problemId) } },
    {
      $group: {
        _id: null,
        totalSubmissions: { $sum: 1 },
        acceptedSubmissions: {
          $sum: { $cond: [{ $eq: ["$status", "Accepted"] }, 1, 0] }
        },
        uniqueUsers: { $addToSet: "$userId" },
        languages: { $addToSet: "$language" },
        avgExecutionTime: { $avg: "$executionTime" }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      acceptanceRate: 0,
      uniqueUsers: 0,
      languages: [],
      avgExecutionTime: 0
    };
  }

  const result = stats[0];
  result.acceptanceRate = result.totalSubmissions > 0 ? 
    Math.round((result.acceptedSubmissions / result.totalSubmissions) * 100) : 0;
  result.uniqueUsers = result.uniqueUsers.filter(id => id !== null).length;

  return result;
};

// Pre-save middleware to validate data
submissionSchema.pre('save', function(next) {
  // Ensure test cases passed is not greater than total test cases
  if (this.testCasesPassed > this.totalTestCases) {
    this.testCasesPassed = this.totalTestCases;
  }

  // Set execution time from runtime if not provided
  if (!this.executionTime && this.runtime) {
    const timeMatch = this.runtime.match(/(\d+)/);
    if (timeMatch) {
      this.executionTime = parseInt(timeMatch[1]);
    }
  }

  // Validate status and test cases relationship
  if (this.status === 'Accepted' && this.testCasesPassed !== this.totalTestCases) {
    // Allow this case but log it
    console.warn(`Submission ${this._id}: Status is Accepted but not all test cases passed`);
  }

  next();
});

submissionSchema.post('save', async function(doc) {
  try {
    if (doc.userId && doc.status === 'Accepted') {
      const User = mongoose.model('User');
      const user = await User.findById(doc.userId);
      
      if (user) {
        const existingAccepted = await this.constructor.findOne({
          userId: doc.userId,
          problemId: doc.problemId,
          status: 'Accepted',
          _id: { $ne: doc._id }
        });

        if (!existingAccepted) {

          if (!user.solvedProblems) user.solvedProblems = [];
          if (!user.solvedProblems.includes(doc.problemId)) {
            user.solvedProblems.push(doc.problemId);

            const Problem = mongoose.model('Problem');
            const problem = await Problem.findById(doc.problemId);
            if (problem) {
              let scoreIncrement = 10;
              switch (problem.difficulty) {
                case "Easy": scoreIncrement = 10; break;
                case "Medium": scoreIncrement = 20; break;
                case "Hard": scoreIncrement = 30; break;
              }
              user.totalScore = (user.totalScore || 0) + scoreIncrement;
            }
          }
        }

        user.totalSubmissions = (user.totalSubmissions || 0) + 1;
        user.lastSubmission = new Date();
        await user.save();
      }
    }
  } catch (error) {
    console.error('Error updating user stats after submission save:', error);
  }
});

module.exports = mongoose.model("Submission", submissionSchema);