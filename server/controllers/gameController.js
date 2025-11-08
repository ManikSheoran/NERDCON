const Hint = require("../models/Hint.js");
const Pin = require("../models/Pin.js");

const haversineMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getHint = async (req, res) => {
  const team = req.user;
  const hint = await Hint.findOne().skip(team.gameState.currentHintIndex);
  res.json({ currentHintIndex: team.gameState.currentHintIndex, hint });
};

const submitAnswer = async (req, res) => {
  const { pinId, lat, lng } = req.body;
  const team = req.user;
  const hint = await Hint.findOne().skip(team.gameState.currentHintIndex);
  const pin = await Pin.findById(pinId);

  const dist = haversineMeters(lat, lng, pin.location.coordinates[1], pin.location.coordinates[0]);
  if (dist > 200) return res.status(400).json({ message: "Not near correct zone" });

  const correct = String(hint.correctPin) === String(pin._id);
  if (correct) {
    const earned = Math.max(hint.scoreValue - team.gameState.penalties * 10, 0);
    team.gameState.score += earned;
    team.gameState.penalties = 0;
    team.gameState.currentHintIndex += 1;
    // record the time of this successful submission
    team.gameState.lastHintSubmittedAt = new Date();
    await team.save();
    return res.json({ success: true, earned, totalScore: team.gameState.score });
  } else {
    team.gameState.penalties += 1;
    // record the time of this (failed) submission as well
    team.gameState.lastHintSubmittedAt = new Date();
    await team.save();
    return res.json({ success: false, penalties: team.gameState.penalties });
  }
};

// Leaderboard: return teams with name, current hint index, score and last submission time
const getLeaderboard = async (req, res) => {
  try {
    // top teams by score
    const teams = await require('../models/Team.js')
      .find({}, { name: 1, 'gameState.currentHintIndex': 1, 'gameState.score': 1, 'gameState.lastHintSubmittedAt': 1 })
      .sort({ 'gameState.score': -1 })
      .limit(50)
      .lean();

    const payload = teams.map(t => ({
      name: t.name,
      currentHintIndex: t.gameState?.currentHintIndex ?? 0,
      score: t.gameState?.score ?? 0,
      lastHintSubmittedAt: t.gameState?.lastHintSubmittedAt ?? null,
    }));

    res.json({ leaderboard: payload });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getState = async (req, res) => {
  const { gameState } = req.user;
  res.json(gameState);
};

module.exports = { getHint, submitAnswer, getState, getLeaderboard };
