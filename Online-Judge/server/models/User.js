const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minLength: 6
  },
  avatar: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
  },
  bio: {
    type: String,
    default: "",
    maxLength: 500
  },
  // Coding statistics
  totalScore: {
    type: Number,
    default: 0
  },
  solvedProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem"
  }],
  totalSubmissions: {
    type: Number,
    default: 0
  },
  // Contest participation
  contestsParticipated: [{
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest"
    },
    rank: Number,
    score: Number,
    participationDate: {
      type: Date,
      default: Date.now
    }
  }],
  // User preferences
  preferredLanguage: {
    type: String,
    enum: ["cpp", "c", "java", "python"],
    default: "cpp"
  },
  // Profile visibility
  isPublic: {
    type: Boolean,
    default: true
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Role for admin features
  role: {
    type: String,
    enum: ["user", "admin", "moderator"],
    default: "user"
  },
  // Social links (optional)
  socialLinks: {
    github: String,
    linkedin: String,
    website: String
  },
  // Notification preferences
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    contest: {
      type: Boolean,
      default: true
    },
    comments: {
      type: Boolean,
      default: true
    }
  },
  // Last activity tracking
  lastLogin: {
    type: Date,
    default: Date.now
  },
  lastSubmission: {
    type: Date
  }
}, { 
  timestamps: true,
  // Add index for better query performance
  index: {
    email: 1,
    totalScore: -1,
    createdAt: -1
  }
});

// Virtual for username (alias for name)
UserSchema.virtual('username').get(function() {
  return this.name;
});

UserSchema.virtual('username').set(function(username) {
  this.name = username;
});

// Virtual for solved problems count
UserSchema.virtual('solvedProblemsCount').get(function() {
  return this.solvedProblems ? this.solvedProblems.length : 0;
});

// Virtual for contests participated count
UserSchema.virtual('contestsParticipatedCount').get(function() {
  return this.contestsParticipated ? this.contestsParticipated.length : 0;
});

// Instance method to update last login
UserSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Instance method to add solved problem
UserSchema.methods.addSolvedProblem = function(problemId) {
  if (!this.solvedProblems.includes(problemId)) {
    this.solvedProblems.push(problemId);
  }
  return this;
};

// Instance method to calculate accuracy
UserSchema.methods.getAccuracy = function() {
  if (this.totalSubmissions === 0) return 0;
  return Math.round((this.solvedProblemsCount / this.totalSubmissions) * 100);
};

// Static method to get leaderboard
UserSchema.statics.getLeaderboard = function(limit = 100, skip = 0) {
  return this.find({ isActive: true })
    .select('name email avatar totalScore solvedProblems totalSubmissions createdAt')
    .sort({ totalScore: -1, solvedProblems: -1, createdAt: 1 })
    .limit(limit)
    .skip(skip);
};

// Pre-save middleware to ensure valid data
UserSchema.pre('save', function(next) {
  // Ensure score is never negative
  if (this.totalScore < 0) this.totalScore = 0;
  
  // Ensure submissions count is never negative
  if (this.totalSubmissions < 0) this.totalSubmissions = 0;
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(this.email)) {
    return next(new Error('Invalid email format'));
  }
  
  next();
});

// Create indexes for better performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ totalScore: -1 });
UserSchema.index({ 'solvedProblems': 1 });
UserSchema.index({ isActive: 1, totalScore: -1 });

module.exports = mongoose.model("User", UserSchema);