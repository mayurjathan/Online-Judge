const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");

router.get("/home", verifyToken, (req, res) => {
  res.json({
    message: "Welcome to your home!",
    user: req.user, 
  });
});

module.exports = router;
