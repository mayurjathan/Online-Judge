// models/Contest.js
const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true,
    validate: {
      validator: function(endTime) {
        return endTime > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  problems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  }],
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  maxParticipants: {
    type: Number,
    default: 100,
    min: 1,
    max: 10000
  },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'past'],
    default: 'upcoming'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rules: [{
    type: String,
    maxlength: 500
  }],
  prizes: [{
    type: String,
    maxlength: 300
  }],
  // Additional fields that might be useful
  isPublic: {
    type: Boolean,
    default: true
  },
  registrationStartTime: {
    type: Date,
    default: Date.now
  },
  registrationEndTime: {
    type: Date
  },
  // Contest settings
  allowedLanguages: [{
    type: String,
    enum: ['javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust']
  }],
  scoringType: {
    type: String,
    enum: ['icpc', 'ioi', 'cf'],
    default: 'icpc'
  },
  // Metadata
  problemCount: {
    type: Number,
    default: 0
  },
  participantCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
contestSchema.index({ status: 1 });
contestSchema.index({ startTime: 1 });
contestSchema.index({ endTime: 1 });
contestSchema.index({ participants: 1 });
contestSchema.index({ 'name': 'text', 'description': 'text' });

// Virtual fields
contestSchema.virtual('duration').get(function() {
  return this.endTime - this.startTime;
});

contestSchema.virtual('isRegistrationOpen').get(function() {
  const now = new Date();
  const regStart = this.registrationStartTime || this.createdAt;
  const regEnd = this.registrationEndTime || this.startTime;
  return now >= regStart && now <= regEnd && this.status === 'upcoming';
});

contestSchema.virtual('timeUntilStart').get(function() {
  const now = new Date();
  return Math.max(0, this.startTime - now);
});

contestSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  if (this.status !== 'live') return 0;
  return Math.max(0, this.endTime - now);
});

// Pre-save middleware to update computed fields
contestSchema.pre('save', function(next) {
  // Update problem count
  this.problemCount = this.problems.length;
  
  // Update participant count
  this.participantCount = this.participants.length;
  
  // Auto-update status based on time
  const now = new Date();
  if (now < this.startTime) {
    this.status = 'upcoming';
  } else if (now >= this.startTime && now <= this.endTime) {
    this.status = 'live';
  } else {
    this.status = 'past';
  }
  
  // Set registration end time if not set
  if (!this.registrationEndTime) {
    this.registrationEndTime = this.startTime;
  }
  
  next();
});

// Instance methods
contestSchema.methods.addParticipant = function(userId) {
  if (!this.participants.includes(userId) && this.participants.length < this.maxParticipants) {
    this.participants.push(userId);
    this.participantCount = this.participants.length;
    return this.save();
  }
  throw new Error('Cannot add participant');
};

contestSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(id => !id.equals(userId));
  this.participantCount = this.participants.length;
  return this.save();
};

contestSchema.methods.isUserRegistered = function(userId) {
  return this.participants.some(id => id.equals(userId));
};

contestSchema.methods.canUserRegister = function(userId) {
  return this.isRegistrationOpen && 
         !this.isUserRegistered(userId) && 
         this.participants.length < this.maxParticipants;
};

// Static methods
contestSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

contestSchema.statics.findLive = function() {
  return this.find({ status: 'live' });
};

contestSchema.statics.findUpcoming = function() {
  return this.find({ status: 'upcoming' }).sort({ startTime: 1 });
};

contestSchema.statics.findPast = function() {
  return this.find({ status: 'past' }).sort({ startTime: -1 });
};

contestSchema.statics.updateStatuses = function() {
  const now = new Date();
  return Promise.all([
    this.updateMany(
      { startTime: { $gt: now }, status: { $ne: 'upcoming' } },
      { status: 'upcoming' }
    ),
    this.updateMany(
      { 
        startTime: { $lte: now }, 
        endTime: { $gt: now }, 
        status: { $ne: 'live' } 
      },
      { status: 'live' }
    ),
    this.updateMany(
      { endTime: { $lte: now }, status: { $ne: 'past' } },
      { status: 'past' }
    )
  ]);
};

// Make sure virtuals are included when converting to JSON
contestSchema.set('toJSON', { virtuals: true });
contestSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Contest', contestSchema);