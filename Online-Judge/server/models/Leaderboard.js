const mongoose = require('mongoose');

const LeaderboardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, default: 0 },
  rank: { type: Number },
  contestsParticipated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contest' }]
});

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);
