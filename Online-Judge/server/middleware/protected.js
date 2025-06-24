const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");

router.get("/profile", verifyToken, (req, res) => {
  res.json({
    message: "Welcome to your profile!",
    user: req.user, // this comes from decoded JWT
  });
});

module.exports = router;
