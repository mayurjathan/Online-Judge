const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
  title: String,
  description: String,
  difficulty: String,
  testCases: [
    {
      input: String,
      output: String,
    },
  ],
});

module.exports = mongoose.model("Problem", problemSchema);
