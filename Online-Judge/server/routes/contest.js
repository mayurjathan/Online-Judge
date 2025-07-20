const express = require("express");
const router = express.Router();
const Contest = require("../models/Contest");
const Problem = require("../models/Problem");
const User = require("../models/User");
const Submission = require("../models/Submission");
const verifyToken = require("../middleware/auth");

// Get all contests with status filtering
router.get("/", async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const now = new Date();
    
    let filter = {};
    
    // Add status filter if provided
    if (status) {
      switch (status) {
        case 'live':
          filter = {
            startTime: { $lte: now },
            endTime: { $gt: now }
          };
          break;
        case 'upcoming':
          filter = {
            startTime: { $gt: now }
          };
          break;
        case 'past':
          filter = {
            endTime: { $lte: now }
          };
          break;
      }
    }

    const contests = await Contest.find(filter)
      .populate('problems', 'title difficulty')
      .populate('participants', 'name username')
      .sort({ startTime: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Add computed status to each contest
    const contestsWithStatus = contests.map(contest => {
      let contestStatus = 'upcoming';
      if (now >= contest.startTime && now <= contest.endTime) {
        contestStatus = 'live';
      } else if (now > contest.endTime) {
        contestStatus = 'past';
      }

      return {
        ...contest.toObject(),
        status: contestStatus,
        participantCount: contest.participants ? contest.participants.length : 0,
        problemCount: contest.problems ? contest.problems.length : 0
      };
    });

    const total = await Contest.countDocuments(filter);

    res.json({
      contests: contestsWithStatus,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    console.error("Error fetching contests:", error);
    res.status(500).json({ error: "Failed to fetch contests" });
  }
});

// Get specific contest by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const contest = await Contest.findById(id)
      .populate('problems', 'title description difficulty')
      .populate('participants', 'name username email avatar');

    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    const now = new Date();
    let status = 'upcoming';
    if (now >= contest.startTime && now <= contest.endTime) {
      status = 'live';
    } else if (now > contest.endTime) {
      status = 'past';
    }

    const contestData = {
      ...contest.toObject(),
      status,
      participantCount: contest.participants ? contest.participants.length : 0,
      problemCount: contest.problems ? contest.problems.length : 0
    };

    res.json(contestData);

  } catch (error) {
    console.error("Error fetching contest:", error);
    res.status(500).json({ error: "Failed to fetch contest" });
  }
});

// Get contest details (same as specific contest but for details page)
router.get("/:id/details", async (req, res) => {
  try {
    const { id } = req.params;

    const contest = await Contest.findById(id)
      .populate('problems', 'title description difficulty tags')
      .populate('participants', 'name username email avatar');

    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    const now = new Date();
    let status = 'upcoming';
    if (now >= contest.startTime && now <= contest.endTime) {
      status = 'live';
    } else if (now > contest.endTime) {
      status = 'past';
    }

    // Calculate contest statistics
    const contestStats = {
      totalParticipants: contest.participants ? contest.participants.length : 0,
      totalProblems: contest.problems ? contest.problems.length : 0,
      difficulty: {
        easy: contest.problems ? contest.problems.filter(p => p.difficulty === 'Easy').length : 0,
        medium: contest.problems ? contest.problems.filter(p => p.difficulty === 'Medium').length : 0,
        hard: contest.problems ? contest.problems.filter(p => p.difficulty === 'Hard').length : 0
      }
    };

    const contestData = {
      ...contest.toObject(),
      status,
      stats: contestStats
    };

    res.json(contestData);

  } catch (error) {
    console.error("Error fetching contest details:", error);
    res.status(500).json({ error: "Failed to fetch contest details" });
  }
});

// Register for a contest
router.post("/:id/register", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    const now = new Date();
    if (now >= contest.startTime) {
      return res.status(400).json({ error: "Cannot register for a contest that has already started" });
    }

    // Check if user is already registered
    if (contest.participants && contest.participants.includes(userId)) {
      return res.status(400).json({ error: "Already registered for this contest" });
    }

    // Add user to participants
    if (!contest.participants) contest.participants = [];
    contest.participants.push(userId);
    await contest.save();

    res.json({ message: "Successfully registered for contest" });

  } catch (error) {
    console.error("Error registering for contest:", error);
    res.status(500).json({ error: "Failed to register for contest" });
  }
});

// Unregister from a contest
router.post("/:id/unregister", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    const now = new Date();
    if (now >= contest.startTime) {
      return res.status(400).json({ error: "Cannot unregister from a contest that has already started" });
    }

    // Remove user from participants
    if (contest.participants) {
      contest.participants = contest.participants.filter(
        participant => participant.toString() !== userId
      );
      await contest.save();
    }

    res.json({ message: "Successfully unregistered from contest" });

  } catch (error) {
    console.error("Error unregistering from contest:", error);
    res.status(500).json({ error: "Failed to unregister from contest" });
  }
});

// Get contest leaderboard/results
router.get("/:id/leaderboard", async (req, res) => {
  try {
    const { id } = req.params;

    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    // Get all submissions for this contest's problems during contest time
    const contestSubmissions = await Submission.find({
      problemId: { $in: contest.problems },
      createdAt: {
        $gte: contest.startTime,
        $lte: contest.endTime
      }
    }).populate('userId', 'name username email avatar')
      .populate('problemId', 'title difficulty');

    // Calculate scores for each participant
    const participantScores = {};
    const problemScoring = {
      'Easy': 100,
      'Medium': 200,
      'Hard': 300
    };

    contestSubmissions.forEach(submission => {
      const userId = submission.userId._id.toString();
      if (!participantScores[userId]) {
        participantScores[userId] = {
          user: submission.userId,
          totalScore: 0,
          problemsSolved: 0,
          submissions: 0,
          lastSubmission: null,
          problemDetails: {}
        };
      }

      const participant = participantScores[userId];
      participant.submissions++;
      
      if (!participant.lastSubmission || submission.createdAt > participant.lastSubmission) {
        participant.lastSubmission = submission.createdAt;
      }

      const problemId = submission.problemId._id.toString();
      if (!participant.problemDetails[problemId]) {
        participant.problemDetails[problemId] = {
          problem: submission.problemId,
          bestSubmission: null,
          attempts: 0
        };
      }

      const problemDetail = participant.problemDetails[problemId];
      problemDetail.attempts++;

      // Track best submission (accepted takes priority)
      if (submission.status === 'Accepted' && 
          (!problemDetail.bestSubmission || problemDetail.bestSubmission.status !== 'Accepted')) {
        problemDetail.bestSubmission = submission;
        
        // Add score if this is the first accepted submission for this problem
        if (!problemDetail.scored) {
          const baseScore = problemScoring[submission.problemId.difficulty] || 100;
          participant.totalScore += baseScore;
          participant.problemsSolved++;
          problemDetail.scored = true;
        }
      }
    });

    // Convert to array and sort by score, then by problems solved, then by last submission time
    const leaderboard = Object.values(participantScores)
      .sort((a, b) => {
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        if (b.problemsSolved !== a.problemsSolved) return b.problemsSolved - a.problemsSolved;
        return new Date(a.lastSubmission) - new Date(b.lastSubmission);
      })
      .map((participant, index) => ({
        rank: index + 1,
        user: participant.user,
        totalScore: participant.totalScore,
        problemsSolved: participant.problemsSolved,
        submissions: participant.submissions,
        lastSubmission: participant.lastSubmission,
        problems: Object.values(participant.problemDetails).map(pd => ({
          problem: pd.problem,
          status: pd.bestSubmission?.status || 'Not Attempted',
          attempts: pd.attempts,
          submissionTime: pd.bestSubmission?.createdAt
        }))
      }));

    res.json({
      contest: {
        _id: contest._id,
        name: contest.name,
        startTime: contest.startTime,
        endTime: contest.endTime
      },
      leaderboard
    });

  } catch (error) {
    console.error("Error fetching contest leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch contest leaderboard" });
  }
});

// Get contest results (alias for leaderboard)
router.get("/:id/results", async (req, res) => {
  // Redirect to leaderboard endpoint
  req.url = req.url.replace('/results', '/leaderboard');
  return router.handle(req, res);
});

// Create a new contest (admin only)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      startTime, 
      endTime, 
      problems 
    } = req.body;

    // Basic validation
    if (!name || !startTime || !endTime) {
      return res.status(400).json({ error: "Name, start time, and end time are required" });
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ error: "Start time must be before end time" });
    }

    // Verify problems exist
    if (problems && problems.length > 0) {
      const existingProblems = await Problem.find({ _id: { $in: problems } });
      if (existingProblems.length !== problems.length) {
        return res.status(400).json({ error: "Some problems do not exist" });
      }
    }

    const contest = new Contest({
      name,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      problems: problems || [],
      participants: []
    });

    await contest.save();
    await contest.populate('problems', 'title difficulty');

    res.status(201).json(contest);

  } catch (error) {
    console.error("Error creating contest:", error);
    res.status(500).json({ error: "Failed to create contest" });
  }
});

// Update a contest (admin only)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating if contest has started
    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    const now = new Date();
    if (now >= contest.startTime) {
      return res.status(400).json({ error: "Cannot update a contest that has already started" });
    }

    // Validate time updates
    if (updates.startTime && updates.endTime) {
      if (new Date(updates.startTime) >= new Date(updates.endTime)) {
        return res.status(400).json({ error: "Start time must be before end time" });
      }
    }

    // Verify problems if being updated
    if (updates.problems) {
      const existingProblems = await Problem.find({ _id: { $in: updates.problems } });
      if (existingProblems.length !== updates.problems.length) {
        return res.status(400).json({ error: "Some problems do not exist" });
      }
    }

    const updatedContest = await Contest.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('problems', 'title difficulty');

    res.json(updatedContest);

  } catch (error) {
    console.error("Error updating contest:", error);
    res.status(500).json({ error: "Failed to update contest" });
  }
});

// Delete a contest (admin only)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    // Don't allow deleting if contest has started
    const now = new Date();
    if (now >= contest.startTime) {
      return res.status(400).json({ error: "Cannot delete a contest that has already started" });
    }

    await Contest.findByIdAndDelete(id);
    res.json({ message: "Contest deleted successfully" });

  } catch (error) {
    console.error("Error deleting contest:", error);
    res.status(500).json({ error: "Failed to delete contest" });
  }
});

// Get user's contest participation history
router.get("/user/history", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const contests = await Contest.find({
      participants: userId
    })
    .populate('problems', 'title')
    .sort({ startTime: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Contest.countDocuments({ participants: userId });

    // Add status and user's performance to each contest
    const now = new Date();
    const contestsWithStatus = await Promise.all(contests.map(async (contest) => {
      let status = 'upcoming';
      if (now >= contest.startTime && now <= contest.endTime) {
        status = 'live';
      } else if (now > contest.endTime) {
        status = 'past';
      }

      // Get user's submissions for this contest
      const userSubmissions = await Submission.find({
        userId,
        problemId: { $in: contest.problems },
        createdAt: {
          $gte: contest.startTime,
          $lte: contest.endTime
        }
      });

      const problemsSolved = new Set();
      userSubmissions.forEach(sub => {
        if (sub.status === 'Accepted') {
          problemsSolved.add(sub.problemId.toString());
        }
      });

      return {
        ...contest.toObject(),
        status,
        userStats: {
          problemsSolved: problemsSolved.size,
          totalSubmissions: userSubmissions.length,
          problems: contest.problems.length
        }
      };
    }));

    res.json({
      contests: contestsWithStatus,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    console.error("Error fetching user contest history:", error);
    res.status(500).json({ error: "Failed to fetch contest history" });
  }
});

// Get contest problems for participants
router.get("/:id/problems", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const contest = await Contest.findById(id)
      .populate('problems', 'title description difficulty examples constraints visibleTestCases');

    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    const now = new Date();
    
    // Check if contest is live and user is registered
    if (now < contest.startTime || now > contest.endTime) {
      return res.status(400).json({ error: "Contest is not currently active" });
    }

    if (!contest.participants.includes(userId)) {
      return res.status(403).json({ error: "You must be registered to view contest problems" });
    }

    // Get user's submission status for each problem
    const userSubmissions = await Submission.find({
      userId,
      problemId: { $in: contest.problems.map(p => p._id) },
      createdAt: { $gte: contest.startTime, $lte: contest.endTime }
    });

    const problemsWithStatus = contest.problems.map(problem => {
      const submissions = userSubmissions.filter(s => s.problemId.toString() === problem._id.toString());
      const acceptedSubmission = submissions.find(s => s.status === 'Accepted');
      
      return {
        ...problem.toObject(),
        submissionStatus: acceptedSubmission ? 'Accepted' : (submissions.length > 0 ? 'Attempted' : 'Not Attempted'),
        submissionCount: submissions.length
      };
    });

    res.json({
      contest: {
        _id: contest._id,
        name: contest.name,
        startTime: contest.startTime,
        endTime: contest.endTime
      },
      problems: problemsWithStatus
    });

  } catch (error) {
    console.error("Error fetching contest problems:", error);
    res.status(500).json({ error: "Failed to fetch contest problems" });
  }
});

// Get user's contest standings/rank
router.get("/:id/standings/:userId?", async (req, res) => {
  try {
    const { id, userId } = req.params;
    const targetUserId = userId || req.user?.id;

    if (!targetUserId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    // Get contest submissions
    const contestSubmissions = await Submission.find({
      problemId: { $in: contest.problems },
      createdAt: {
        $gte: contest.startTime,
        $lte: contest.endTime
      }
    }).populate('userId', 'name username');

    // Calculate user's performance
    const userSubmissions = contestSubmissions.filter(s => s.userId._id.toString() === targetUserId);
    const solvedProblems = new Set();
    let totalScore = 0;
    const problemScoring = { 'Easy': 100, 'Medium': 200, 'Hard': 300 };

    userSubmissions.forEach(submission => {
      if (submission.status === 'Accepted') {
        const problemId = submission.problemId.toString();
        if (!solvedProblems.has(problemId)) {
          solvedProblems.add(problemId);
          // Get problem difficulty for scoring
          Problem.findById(submission.problemId).then(problem => {
            if (problem) {
              totalScore += problemScoring[problem.difficulty] || 100;
            }
          });
        }
      }
    });

    // Calculate rank (simplified)
    const allParticipants = new Set(contestSubmissions.map(s => s.userId._id.toString()));
    let rank = 1;
    
    // This is a simplified ranking calculation
    // In a real implementation, you'd want to calculate all participants' scores first
    
    res.json({
      userId: targetUserId,
      contest: {
        _id: contest._id,
        name: contest.name
      },
      standings: {
        rank,
        totalScore,
        problemsSolved: solvedProblems.size,
        totalSubmissions: userSubmissions.length,
        participants: allParticipants.size
      }
    });

  } catch (error) {
    console.error("Error fetching contest standings:", error);
    res.status(500).json({ error: "Failed to fetch contest standings" });
  }
});

module.exports = router;