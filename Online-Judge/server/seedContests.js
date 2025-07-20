const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Contest = require("./models/Contest"); // Adjust path as needed
const Problem = require("./models/Problem"); // To get actual problem IDs

dotenv.config();

const createContestData = async () => {
  // Get some actual problem IDs from the database
  const problems = await Problem.find({}).limit(10);
  const problemIds = problems.map(p => p._id);

  const now = new Date();

  return [
    {
      name: "Weekly Beginner Challenge",
      description: "Perfect for newcomers to competitive programming! This contest features easy to medium problems focusing on basic algorithms, data structures, and problem-solving techniques. Great for building confidence and learning fundamental concepts.",
      startTime: new Date(now.getTime() + 2 * 60 * 30 * 1000), // Starts in 2 hours
      endTime: new Date(now.getTime() + 4 * 60 * 60 * 1000), // 2 hour duration
      problems: problemIds.slice(0, 4), // First 4 problems
      participants: [],
      maxParticipants: 200,
      status: "upcoming",
      createdBy: null, // You can set admin user ID here
      rules: [
        "Each problem has a time limit of 2 seconds",
        "Solutions must pass all test cases to receive points",
        "Partial scoring is not available",
        "You can submit multiple times with no penalty"
      ],
      prizes: [
        "1st Place: Rush2Code Premium for 6 months",
        "2nd Place: Rush2Code Premium for 3 months", 
        "3rd Place: Rush2Code Premium for 1 month"
      ]
    },
    {
      name: "Algorithm Sprint Championship",
      description: "Fast-paced competitive programming contest featuring dynamic programming, graph algorithms, and advanced data structures. This contest is designed for intermediate to advanced programmers looking for a real challenge!",
      startTime: new Date(now.getTime() - 30 * 60 * 1000), // Started 30 minutes ago
      endTime: new Date(now.getTime() + 90 * 60 * 1000), // Ends in 1.5 hours (2 hour total duration)
      problems: problemIds.slice(2, 7), // Problems 3-7
      participants: [],
      maxParticipants: 100,
      status: "live",
      createdBy: null,
      rules: [
        "Each problem has a time limit of 3 seconds",
        "Wrong submissions incur a 5-minute penalty",
        "Rankings based on problems solved and total time",
        "Tie-breaking by submission time"
      ],
      prizes: [
        "1st Place: $500 cash prize + Certificate",
        "2nd Place: $300 cash prize + Certificate",
        "3rd Place: $200 cash prize + Certificate",
        "Top 10: Special recognition badges"
      ]
    },
    {
      name: "Data Structures Mastery",
      description: "Deep dive into advanced data structures including trees, heaps, hash tables, and graph representations. This contest will test your understanding of complex data structure operations and their applications in solving real-world problems.",
      startTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours duration
      problems: problemIds.slice(1, 6), // Problems 2-6
      participants: [],
      maxParticipants: 75,
      status: "past",
      createdBy: null,
      rules: [
        "Focus on tree and graph problems",
        "Memory limit: 256 MB",
        "Time limit: 2 seconds per problem",
        "Full feedback on sample test cases"
      ],
      prizes: [
        "1st Place: Data Structures & Algorithms Book Collection",
        "2nd Place: Programming Interview Prep Course",
        "3rd Place: Algorithm Visualization Tool Access"
      ]
    },
    {
      name: "Monthly Grand Challenge",
      description: "Our biggest contest of the month! A comprehensive programming competition featuring problems from all difficulty levels. Perfect opportunity to test your skills against the best programmers and climb the monthly leaderboard rankings.",
      startTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // In 3 days
      endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours duration
      problems: problemIds.slice(0, 8), // First 8 problems
      participants: [],
      maxParticipants: 500,
      status: "upcoming",
      createdBy: null,
      rules: [
        "Mixed difficulty: Easy, Medium, and Hard problems",
        "Dynamic scoring based on solve rate",
        "Bonus points for early submissions",
        "Live leaderboard updates every 5 minutes"
      ],
      prizes: [
        "1st Place: $1000 + Trophy + 1 year Premium",
        "2nd Place: $600 + Medal + 6 months Premium",
        "3rd Place: $400 + Medal + 3 months Premium",
        "Top 20: Special achievement badges",
        "All participants: Certificate of participation"
      ]
    },
    {
      name: "Speed Coding Blitz",
      description: "Quick-fire coding contest with shorter, algorithmic problems designed to test your speed and accuracy. Each problem should be solvable within 10-15 minutes. Perfect for sharpening your competitive programming reflexes!",
      startTime: new Date(now.getTime() + 6 * 60 * 60 * 1000), // In 6 hours
      endTime: new Date(now.getTime() + 7.5 * 60 * 60 * 1000), // 1.5 hours duration
      problems: problemIds.slice(0, 6), // First 6 problems
      participants: [],
      maxParticipants: 150,
      status: "upcoming",
      createdBy: null,
      rules: [
        "Focus on implementation and basic algorithms",
        "Maximum 15 minutes recommended per problem",
        "No penalty for wrong submissions",
        "First solve bonus: +50 points"
      ],
      prizes: [
        "Fastest Solver: Speed Demon Badge + Premium",
        "Most Problems Solved: Problem Crusher Badge",
        "Top 3: Feature on Rush2Code Hall of Fame"
      ]
    },
    {
      name: "University Championship Qualifier",
      description: "Official qualifier for the Inter-University Programming Championship. This contest follows ICPC-style rules and problem formats. Top performers will be invited to represent their universities in the national championship.",
      startTime: new Date(now.getTime() + 48 * 60 * 60 * 1000), // In 2 days
      endTime: new Date(now.getTime() + 48 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000), // 5 hours duration
      problems: problemIds.slice(3, 9), // Problems 4-9
      participants: [],
      maxParticipants: 300,
      status: "upcoming",
      createdBy: null,
      rules: [
        "ICPC-style scoring and rules",
        "Team participation allowed (max 3 members)",
        "20-minute penalty for wrong submissions",
        "Balloon rewards for first solves"
      ],
      prizes: [
        "Top 10 teams: Qualification for National Championship",
        "1st Place: $2000 scholarship + Laptops for team",
        "2nd Place: $1200 scholarship + Tablets for team",
        "3rd Place: $800 scholarship + Programming books"
      ]
    },
    {
      name: "Array & String Fundamentals",
      description: "Focused contest on array manipulations and string processing algorithms. Great for beginners and intermediate programmers looking to master these fundamental data structures. All problems center around arrays and strings.",
      startTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      endTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000), // 2.5 hours duration
      problems: problemIds.slice(0, 5), // First 5 problems
      participants: [],
      maxParticipants: 120,
      status: "past",
      createdBy: null,
      rules: [
        "All problems involve arrays or strings",
        "Focus on two-pointers, sliding window techniques",
        "Sample test cases visible during contest",
        "Editorial available after contest ends"
      ],
      prizes: [
        "1st Place: Array & String Mastery Certificate",
        "Top 5: Featured solution in Rush2Code blog",
        "All participants: Study materials for data structures"
      ]
    },
    {
      name: "Dynamic Programming Deep Dive",
      description: "Advanced contest dedicated entirely to dynamic programming problems. From basic DP to complex optimization problems, this contest will challenge your ability to identify and implement efficient DP solutions.",
      startTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // In 5 days
      endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours duration
      problems: problemIds.slice(4, 9), // Problems 5-9
      participants: [],
      maxParticipants: 80,
      status: "upcoming",
      createdBy: null,
      rules: [
        "All problems require dynamic programming solutions",
        "Brute force solutions will likely time out",
        "Focus on state definition and transitions",
        "Optimized solutions preferred"
      ],
      prizes: [
        "1st Place: DP Master Badge + Algorithm books",
        "2nd Place: Advanced DP Course Access",
        "3rd Place: One-on-one mentoring session",
        "Best Solution: Featured in DP tutorial series"
      ]
    }
  ];
};

const seedContests = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB successfully!");

    console.log("Checking for existing problems...");
    const problemCount = await Problem.countDocuments();
    if (problemCount === 0) {
      console.log("⚠️  No problems found in database. Please run the problem seeding script first!");
      console.log("Run: node seedProblems.js");
      process.exit(1);
    }
    console.log(`Found ${problemCount} problems in database.`);

    console.log("Clearing existing contests...");
    const deleteResult = await Contest.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing contests.`);

    console.log("Creating contest data...");
    const contestData = await createContestData();

    console.log("Inserting new contests...");
    const insertResult = await Contest.insertMany(contestData);
    console.log(`Successfully inserted ${insertResult.length} contests:`);
    
    insertResult.forEach((contest, index) => {
      console.log(`${index + 1}. ${contest.name} (${contest.status.toUpperCase()})`);
      console.log(`   Start: ${contest.startTime.toLocaleString()}`);
      console.log(`   End: ${contest.endTime.toLocaleString()}`);
      console.log(`   Max Participants: ${contest.maxParticipants}`);
      console.log(`   Problems: ${contest.problems.length}`);
      console.log("");
    });

    console.log("\n✅ Contest database seeded successfully!");
    console.log(`Total contests in database: ${insertResult.length}`);
    
    // Verify the insertion
    const count = await Contest.countDocuments();
    console.log(`Verification: ${count} contests found in database.`);

    // Show contest status breakdown
    const liveCount = await Contest.countDocuments({ status: 'live' });
    const upcomingCount = await Contest.countDocuments({ status: 'upcoming' });
    const pastCount = await Contest.countDocuments({ status: 'past' });
    
    console.log("\n📊 Contest Status Breakdown:");
    console.log(`   Live: ${liveCount}`);
    console.log(`   Upcoming: ${upcomingCount}`);
    console.log(`   Past: ${pastCount}`);

  } catch (err) {
    console.error("❌ Error seeding contests:", err);
    if (err.code === 11000) {
      console.error("Duplicate key error - contest names must be unique");
    }
    if (err.name === 'ValidationError') {
      console.error("Validation error:", err.message);
    }
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, closing database connection...');
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, closing database connection...');
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(0);
});

// Add some helper functions for testing
const createSingleContest = async (contestData) => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    const contest = new Contest(contestData);
    const result = await contest.save();
    console.log(`Created contest: ${result.name}`);
    
    await mongoose.connection.close();
    return result;
  } catch (err) {
    console.error("Error creating single contest:", err);
    await mongoose.connection.close();
  }
};

// Export for use in other scripts
module.exports = {
  seedContests,
  createContestData,
  createSingleContest
};

// If running directly
if (require.main === module) {
  console.log("🚀 Starting contest seeding process...");
  console.log("This will create sample contests with different statuses:");
  console.log("   • Live contests (currently running)");
  console.log("   • Upcoming contests (future)"); 
  console.log("   • Past contests (completed)");
  console.log("");
  
  seedContests();
}