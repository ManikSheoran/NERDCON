const express = require('express');
const { protect } = require("../middleware/auth.js");
const { getHint, submitAnswer, getState, getLeaderboard } = require("../controllers/gameController.js");
const router = express.Router();

router.get("/hint", protect, getHint);
router.post("/submit", protect, submitAnswer);
router.get("/state", protect, getState);

// Leaderboard is public - returns top teams with name, current hint index, score and last submission time
router.get("/leaderboard", getLeaderboard);

module.exports = router;
