const express = require('express');
const { protect } = require("../middleware/auth.js");
const { getHint, submitAnswer, getState, getLeaderboard, getNearbyPins, unlockIntel } = require("../controllers/gameController.js");
const router = express.Router();

router.get("/hint", protect, getHint);
router.post("/submit", protect, submitAnswer);
router.post("/unlock-intel", protect, unlockIntel);
router.get("/state", protect, getState);

// Get pins within ~200 meters of provided location (protected)
router.get("/pins/nearby", protect, getNearbyPins);

// Leaderboard is public - returns top teams with name, visited locations count, score and last submission time
router.get("/leaderboard", getLeaderboard);

module.exports = router;
