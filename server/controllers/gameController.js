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
        text: "Complete all 8 previous hints to unlock the final challenge image!"
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
    
    // Check if this specific pin has already been submitted for this hint
    const alreadySubmitted = team.gameState.submittedPins?.some(
      sp => String(sp.hintId) === String(hint._id) && String(sp.pinId) === String(pin._id)
    );
    
    if (alreadySubmitted) {
      return res.json({ 
        success: true, 
        earned: 0,
        totalScore: team.gameState.score,
        penalties: team.gameState.penalties,
        message: "You've already found this location for this hint!"
      });
    }
    
    // Add this pin to submitted pins
    team.gameState.submittedPins = team.gameState.submittedPins || [];
    team.gameState.submittedPins.push({
      hintId: hint._id,
      pinId: pin._id,
      submittedAt: new Date()
    });
    
    // Count how many correct pins have been found for this hint
    const foundPinsForThisHint = team.gameState.submittedPins.filter(
      sp => String(sp.hintId) === String(hint._id)
    ).length;
    
    const totalCorrectPins = hint.correctPins.length;
    const allPinsFound = foundPinsForThisHint >= totalCorrectPins;
    
    // Add score for this pin
    team.gameState.score += hint.scoreValue;
    team.gameState.lastHintSubmittedAt = new Date();
    
    // If all pins are found, move to next hint and mark as completed
    if (allPinsFound) {
      team.gameState.currentHintIndex += 1;
      team.gameState.completedHints = team.gameState.completedHints || [];
      team.gameState.completedHints.push(hint._id);
    }
    
    await team.save();
    
    // Check if this was the final hint
    if (hint.isFinalHint && allPinsFound) {
      return res.json({ 
        success: true, 
        earned: hint.scoreValue, 
        totalScore: team.gameState.score,
        penalties: team.gameState.penalties,
        gameCompleted: true,
        message: `Congratulations! You've completed all hints! (${foundPinsForThisHint}/${totalCorrectPins} locations found)`
      });
    }
    
    return res.json({ 
      success: true, 
      earned: hint.scoreValue, 
      totalScore: team.gameState.score,
      penalties: team.gameState.penalties,
      allPinsFound,
      foundPins: foundPinsForThisHint,
      totalPins: totalCorrectPins,
      message: allPinsFound 
        ? `Perfect! All locations found! Moving to next hint. (${foundPinsForThisHint}/${totalCorrectPins})`
        : `Correct! Keep searching for more locations. (${foundPinsForThisHint}/${totalCorrectPins})`
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
