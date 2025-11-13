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
  
  // Allow viewing specific hint by hint_id query parameter
  const requestedHintId = req.query.hint_id ? parseInt(req.query.hint_id) : null;
  
  let hint;
  if (requestedHintId) {
    // Team wants to view a specific hint - check if they've unlocked it
    hint = await Hint.findOne({ hint_id: requestedHintId });
    if (!hint) {
      return res.status(404).json({ message: "Hint not found" });
    }
    
    // Check if this hint has been unlocked (hint_id <= currentHintIndex + 1)
    if (requestedHintId > team.gameState.currentHintIndex + 1) {
      return res.status(403).json({ message: "You haven't unlocked this hint yet!" });
    }
  } else {
    // Default: show current hint
    hint = await Hint.findOne().skip(team.gameState.currentHintIndex);
  }
  
  if (!hint) {
    return res.status(404).json({ message: "No more hints available" });
  }
  
  // Check if this is the final hint (hint 9)
  const isFinalHint = hint.isFinalHint || false;
  
  // If it's the final hint, check if team has visited all unique locations
  if (isFinalHint) {
    // Get all unique pins from hints 1-8
    const allHints = await Hint.find({ isFinalHint: false }).lean();
    const allUniquePins = new Set();
    allHints.forEach(h => {
      h.correctPins.forEach(pinId => allUniquePins.add(String(pinId)));
    });
    
    // Get unique pins the team has submitted
    const submittedPins = team.gameState.submittedPins || [];
    const uniqueSubmittedPins = new Set(submittedPins.map(sp => String(sp.pinId)));
    
    const totalUniquePins = allUniquePins.size;
    const visitedUniquePins = uniqueSubmittedPins.size;
    
    // If not all unique pins have been visited, hide the image
    if (visitedUniquePins < totalUniquePins) {
      const hintWithoutImage = {
        ...hint.toObject(),
        imagePath: null,
        text: `🔒 Visit all unique locations to unlock the final challenge! (${visitedUniquePins}/${totalUniquePins} locations discovered)`
      };
      
      return res.json({ 
        currentHintIndex: team.gameState.currentHintIndex, 
        hint: hintWithoutImage,
        isFinalHint: true,
        locked: true,
        visitedLocations: visitedUniquePins,
        requiredLocations: totalUniquePins
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
  const { pinId, lat, lng, hintId } = req.body;
  const team = req.user;
  
  // Check if team has reached penalty limit
  if (team.gameState.penalties >= 20) {
    return res.status(403).json({ 
      message: "Maximum penalties reached. You cannot submit anymore.", 
      penalties: team.gameState.penalties 
    });
  }
  
  // If hintId is provided, use that hint; otherwise use current hint
  let hint;
  if (hintId) {
    hint = await Hint.findById(hintId);
    if (!hint) {
      return res.status(404).json({ message: "Hint not found" });
    }
    
    // Check if team has unlocked this hint
    if (hint.hint_id > team.gameState.currentHintIndex + 1) {
      return res.status(403).json({ message: "You haven't unlocked this hint yet!" });
    }
  } else {
    hint = await Hint.findOne().skip(team.gameState.currentHintIndex);
    if (!hint) {
      return res.status(404).json({ message: "No more hints available" });
    }
  }
  
  // If this is the final hint, check if all unique locations have been visited
  if (hint.isFinalHint) {
    // Get all unique pins from hints 1-8
    const allHints = await Hint.find({ isFinalHint: false }).lean();
    const allUniquePins = new Set();
    allHints.forEach(h => {
      h.correctPins.forEach(pinId => allUniquePins.add(String(pinId)));
    });
    
    // Get unique pins the team has submitted
    const submittedPins = team.gameState.submittedPins || [];
    const uniqueSubmittedPins = new Set(submittedPins.map(sp => String(sp.pinId)));
    
    const totalUniquePins = allUniquePins.size;
    const visitedUniquePins = uniqueSubmittedPins.size;
    
    if (visitedUniquePins < totalUniquePins) {
      return res.status(403).json({ 
        message: `You must visit all unique locations before attempting the final challenge! (${visitedUniquePins}/${totalUniquePins} locations discovered)`,
        visitedLocations: visitedUniquePins,
        requiredLocations: totalUniquePins
      });
    }
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
    
    // Check if this hint has already been completed
    const alreadyCompleted = team.gameState.completedHints?.some(
      h => String(h) === String(hint._id)
    );
    
    // Always move forward if this is their current hint, even if already completed
    const isCurrentHint = hint.hint_id === team.gameState.currentHintIndex + 1;
    
    if (alreadyCompleted && !isCurrentHint) {
      // Completed a previous hint - give 0 points, don't move forward
      return res.json({ 
        success: true, 
        earned: 0,
        totalScore: team.gameState.score,
        penalties: team.gameState.penalties,
        message: "You've already completed this hint!"
      });
    }
    
    // Add score only if not already completed
    if (!alreadyCompleted) {
      team.gameState.score += hint.scoreValue;
      team.gameState.completedHints = team.gameState.completedHints || [];
      team.gameState.completedHints.push(hint._id);
    }
    
    // Always move forward if this is the current hint
    if (isCurrentHint) {
      team.gameState.currentHintIndex += 1;
    }
    
    team.gameState.lastHintSubmittedAt = new Date();
    
    await team.save();
    
    const earnedPoints = alreadyCompleted ? 0 : hint.scoreValue;
    const moveMessage = isCurrentHint ? " Moving to next hint." : "";
    
    // Check if this was the final hint
    if (hint.isFinalHint && isCurrentHint) {
      return res.json({ 
        success: true, 
        earned: earnedPoints, 
        totalScore: team.gameState.score,
        penalties: team.gameState.penalties,
        gameCompleted: true,
        message: "Congratulations! You've completed all hints!"
      });
    }
    
    return res.json({ 
      success: true, 
      earned: earnedPoints, 
      totalScore: team.gameState.score,
      penalties: team.gameState.penalties,
      message: alreadyCompleted 
        ? `Correct location! (0 points - already completed)${moveMessage}`
        : `Correct! +${hint.scoreValue} points.${moveMessage}`
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

// Get all completed hints with their images
const getCompletedHints = async (req, res) => {
  try {
    const team = req.user;
    const completedHintIds = team.gameState.completedHints || [];
    
    if (completedHintIds.length === 0) {
      return res.json({ hints: [] });
    }
    
    // Fetch all completed hints
    const hints = await Hint.find({ _id: { $in: completedHintIds } })
      .select('hint_id imagePath text scoreValue isFinalHint')
      .sort({ hint_id: 1 })
      .lean();
    
    res.json({ hints });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getHint, submitAnswer, getState, getLeaderboard, getNearbyPins, getCompletedHints };
