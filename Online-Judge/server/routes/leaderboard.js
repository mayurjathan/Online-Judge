const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Submission = require("../models/Submission");

// Get leaderboard with filtering options
router.get("/", async (req, res) => {
  try {
    const { period = 'all', limit = 100, page = 1 } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = { createdAt: { $gte: weekAgo } };
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = { createdAt: { $gte: monthAgo } };
        break;
      case 'all':
      default:
        dateFilter = {};
        break;
    }

    let users;
    
    if (period === 'all') {
      // For all-time leaderboard, use user's total stats
      users = await User.find({})
        .select('username email avatar totalScore solvedProblems totalSubmissions createdAt')
        .sort({ totalScore: -1, solvedProblems: -1, createdAt: 1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));
        
      // Calculate additional stats for each user
      users = await Promise.all(users.map(async (user) => {
        const userObj = user.toObject();
        
        // Get total submissions count
        const submissionCount = await Submission.countDocuments({ userId: user._id });
        
        // Calculate accuracy
        const solvedCount = userObj.solvedProblems ? userObj.solvedProblems.length : 0;
        const accuracy = submissionCount > 0 ? Math.round((solvedCount / submissionCount) * 100) : 0;
        
        return {
          ...userObj,
          totalSubmissions: submissionCount,
          accuracy,
          solvedProblemsCount: solvedCount
        };
      }));
      
    } else {
      // For period-based leaderboard, calculate stats from submissions in that period
      const periodSubmissions = await Submission.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$userId',
            acceptedSubmissions: {
              $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] }
            },
            totalSubmissions: { $sum: 1 },
            uniqueProblems: { $addToSet: '$problemId' },
            lastSubmission: { $max: '$createdAt' }
          }
        },
        {
          $project: {
            userId: '$_id',
            acceptedSubmissions: 1,
            totalSubmissions: 1,
            uniqueProblemsCount: { $size: '$uniqueProblems' },
            score: { $multiply: ['$acceptedSubmissions', 10] }, // Simple scoring
            lastSubmission: 1
          }
        },
        { $sort: { score: -1, acceptedSubmissions: -1, lastSubmission: 1 } },
        { $limit: parseInt(limit) },
        { $skip: (parseInt(page) - 1) * parseInt(limit) }
      ]);

      // Get user details for the submissions
      const userIds = periodSubmissions.map(s => s.userId);
      const userDetails = await User.find({ _id: { $in: userIds } })
        .select('username email avatar');
      
      // Combine submission stats with user details
      users = periodSubmissions.map(sub => {
        const user = userDetails.find(u => u._id.toString() === sub.userId.toString());
        return {
          _id: sub.userId,
          username: user?.username || 'Unknown',
          email: user?.email || '',
          avatar: user?.avatar || '',
          totalScore: sub.score,
          solvedProblems: [], // Not needed for period view
          solvedProblemsCount: sub.acceptedSubmissions,
          totalSubmissions: sub.totalSubmissions,
          accuracy: sub.totalSubmissions > 0 ? Math.round((sub.acceptedSubmissions / sub.totalSubmissions) * 100) : 0
        };
      });
    }

    // Add rank to each user
    const rankedUsers = users.map((user, index) => ({
      ...user,
      rank: (parseInt(page) - 1) * parseInt(limit) + index + 1
    }));

    const totalUsers = await User.countDocuments({});

    res.json({
      users: rankedUsers,
      totalPages: Math.ceil(totalUsers / parseInt(limit)),
      currentPage: parseInt(page),
      period,
      total: totalUsers
    });

  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// Get user's rank and position
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'all' } = req.query;

    const user = await User.findById(userId)
      .select('username email avatar totalScore solvedProblems totalSubmissions');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let rank = 0;
    let userStats = {};

    if (period === 'all') {
      // Count users with higher total score
      rank = await User.countDocuments({
        $or: [
          { totalScore: { $gt: user.totalScore } },
          { 
            totalScore: user.totalScore,
            solvedProblems: { $gt: user.solvedProblems ? user.solvedProblems.length : 0 }
          }
        ]
      }) + 1;

      userStats = {
        totalScore: user.totalScore || 0,
        solvedProblems: user.solvedProblems ? user.solvedProblems.length : 0,
        totalSubmissions: user.totalSubmissions || 0
      };
    } else {
      // Calculate rank based on period submissions
      let dateFilter = {};
      const now = new Date();
      
      switch (period) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter = { createdAt: { $gte: weekAgo } };
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateFilter = { createdAt: { $gte: monthAgo } };
          break;
      }

      const userPeriodStats = await Submission.aggregate([
        { $match: { ...dateFilter, userId: user._id } },
        {
          $group: {
            _id: '$userId',
            acceptedSubmissions: {
              $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] }
            },
            totalSubmissions: { $sum: 1 },
            score: { $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 10, 0] } }
          }
        }
      ]);

      const userScore = userPeriodStats.length > 0 ? userPeriodStats[0].score : 0;
      const userAccepted = userPeriodStats.length > 0 ? userPeriodStats[0].acceptedSubmissions : 0;

      // Count users with better period performance
      const betterUsers = await Submission.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$userId',
            acceptedSubmissions: {
              $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] }
            },
            score: { $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 10, 0] } }
          }
        },
        {
          $match: {
            $or: [
              { score: { $gt: userScore } },
              { score: userScore, acceptedSubmissions: { $gt: userAccepted } }
            ]
          }
        },
        { $count: "count" }
      ]);

      rank = betterUsers.length > 0 ? betterUsers[0].count + 1 : 1;

      userStats = {
        totalScore: userScore,
        solvedProblems: userAccepted,
        totalSubmissions: userPeriodStats.length > 0 ? userPeriodStats[0].totalSubmissions : 0
      };
    }

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        rank,
        ...userStats
      },
      period
    });

  } catch (error) {
    console.error("Error fetching user rank:", error);
    res.status(500).json({ error: "Failed to fetch user rank" });
  }
});

module.exports = router;