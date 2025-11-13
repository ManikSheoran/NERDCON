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
  //   const now = new Date();
  // const eventStart = new Date("2025-11-15T11:30:00Z");
  // if (now < eventStart) {
  //   return res.status(403).json({ message: "Quest has not started yet!" });
  // }
  const team = req.user;
  const hint = await Hint.findOne().skip(team.gameState.currentHintIndex);
  
  if (!hint) {
    return res.status(404).json({ message: "No more hints available" });
  }
  
  // Check if this is the final hint (hint 9)
  const isFinalHint = hint.isFinalHint || false;
  
  // If it's the final hint, check if all 8 previous hints are completed
  if (isFinalHint) {
    const completedCount = team.gameState.completedHints?.length || 0;
    
    // If not all 8 previous hints are completed, hide the image
    if (completedCount < 8) {
      const hintWithoutImage = {
        ...hint.toObject(),
        imagePath: null,
        text: "🔒 Complete all 8 previous hints to unlock the final challenge image!"
      };
      
      return res.json({ 
        currentHintIndex: team.gameState.currentHintIndex, 
        hint: hintWithoutImage,
        isFinalHint: true,
        locked: true,
        completedHints: completedCount,
        requiredHints: 8
      });
    }
  }
  
  res.json({ 
    currentHintIndex: team.gameState.currentHintIndex, 
    hint,
    isFinalHint,
    locked: false
  });
};

// Return pins within ~200 meters of provided lat/lng (query params or body)
const getNearbyPins = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat ?? req.body?.lat);
    const lng = parseFloat(req.query.lng ?? req.body?.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return res.status(400).json({ message: 'lat and lng are required' });

    // Use MongoDB geospatial query; $maxDistance is in meters for GeoJSON
    const nearby = await Pin.find({
      location: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: 5000,
        },
      },
    })
      .limit(55)
      .lean();

    const pins = nearby.map(p => ({
      id: p._id,
      name: p.name,
      lat: p.location.coordinates[1],
      lng: p.location.coordinates[0],
      distance: haversineMeters(lat, lng, p.location.coordinates[1], p.location.coordinates[0]),
    }));

    res.json({ pins });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const submitAnswer = async (req, res) => {
  //   const now = new Date();
  // const eventStart = new Date("2025-11-15T11:30:00Z");
  // if (now < eventStart) {
  //   return res.status(403).json({ message: "Quest has not started yet!" });
  // }
  const { pinId, lat, lng } = req.body;
  const team = req.user;
  
  // Check if team has reached penalty limit
  if (team.gameState.penalties >= 20) {
    return res.status(403).json({ 
      message: "Maximum penalties reached. You cannot submit anymore.", 
      penalties: team.gameState.penalties 
    });
  }
  
  const hint = await Hint.findOne().skip(team.gameState.currentHintIndex);
  if (!hint) {
    return res.status(404).json({ message: "No more hints available" });
  }
  
  const pin = await Pin.findById(pinId);
  if (!pin) {
    return res.status(404).json({ message: "Pin not found" });
  }

  const dist = haversineMeters(lat, lng, pin.location.coordinates[1], pin.location.coordinates[0]);
  if (dist > 5000) return res.status(400).json({ message: "Not near correct zone" });

  const correct = hint.correctPins && hint.correctPins.length > 0 
    ? hint.correctPins.some(correctPinId => String(correctPinId) === String(pin._id))
    : false;
  
  if (correct) {
    const Team = require('../models/Team.js');
    const updatedTeam = await Team.findOneAndUpdate(
      {
        _id: team._id,
        'gameState.completedHints': { $ne: hint._id } 
            },
      {
        $inc: { 
          'gameState.score': hint.scoreValue,
          'gameState.currentHintIndex': 1
        },
        $push: { 'gameState.completedHints': hint._id },
        $set: { 'gameState.lastHintSubmittedAt': new Date() }
      },
      { new: true } // Return updated document
    );
    
    // If updatedTeam is null, hint was already completed (race condition prevented)
    if (!updatedTeam) {
      const currentTeam = await Team.findById(team._id);
      return res.json({ 
        success: true, 
        earned: 0,
        totalScore: currentTeam.gameState.score,
        penalties: currentTeam.gameState.penalties,
        message: "You've already completed this hint!"
      });
    }
    
    // Check if this was the final hint
    if (hint.isFinalHint) {
      return res.json({ 
        success: true, 
        earned: hint.scoreValue, 
        totalScore: updatedTeam.gameState.score,
        penalties: updatedTeam.gameState.penalties,
        gameCompleted: true,
        message: "Congratulations! You've completed all hints!"
      });
    }
    
    return res.json({ 
      success: true, 
      earned: hint.scoreValue, 
      totalScore: updatedTeam.gameState.score,
      penalties: updatedTeam.gameState.penalties 
    });
  } else {
    team.gameState.penalties += 1;
    
    team.gameState.lastHintSubmittedAt = new Date();
    await team.save();
    return res.json({ 
      success: false, 
      penalties: team.gameState.penalties,
      message: team.gameState.penalties >= 20 ? "Maximum penalties reached!" : "Incorrect answer" 
    });
  }
};

// Leaderboard: return teams with name, current hint index, score, penalties and last submission time
const getLeaderboard = async (req, res) => {
  try {
    // Check cache first (10 second TTL)
    const cache = req.app.locals.getLeaderboardCache();
    if (cache.data && (Date.now() - cache.timestamp) < 10000) {
      return res.json(cache.data);
    }

    // Sort by score (descending), then by penalties (ascending)
    const teams = await require('../models/Team.js')
      .find({}, { 
        name: 1, 
        'gameState.currentHintIndex': 1, 
        'gameState.score': 1, 
        'gameState.penalties': 1,
        'gameState.lastHintSubmittedAt': 1 
      })
      .sort({ 'gameState.score': -1, 'gameState.penalties': 1 })
      .limit(50)
      .lean();

    const payload = teams.map(t => ({
      name: t.name,
      currentHintIndex: t.gameState?.currentHintIndex ?? 0,
      score: t.gameState?.score ?? 0,
      penalties: t.gameState?.penalties ?? 0,
      lastHintSubmittedAt: t.gameState?.lastHintSubmittedAt ?? null,
    }));

    const result = { leaderboard: payload };
    
    // Cache the result
    req.app.locals.setLeaderboardCache(result);

    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getState = async (req, res) => {
  const { gameState } = req.user;
  res.json(gameState);
};

module.exports = { getHint, submitAnswer, getState, getLeaderboard, getNearbyPins };
