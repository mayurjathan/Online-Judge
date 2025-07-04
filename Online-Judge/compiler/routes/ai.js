const express = require("express");
const router = express.Router();
const aiCodeReview = require("../services/aiCodeReview");

router.post("/ai-review", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    const review = await aiCodeReview(code);

    return res.status(200).json({ review });
  } catch (err) {
    console.error("AI review error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
