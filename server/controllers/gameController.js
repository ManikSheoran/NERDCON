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
  
  // Get current hint the team is working on
  const currentHint = await Hint.findOne({ hint_id: team.gameState.currentHintId }).lean();
  
  if (!currentHint) {
    return res.status(404).json({ message: "No hint available" });
  }
  
  res.json({ 
    hint: currentHint,
    currentHintId: team.gameState.currentHintId,
    completedHints: team.gameState.completedHints || [],
    totalHints: await Hint.countDocuments({ isFinalHint: false })
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
      id: p.pin_id, // Use custom pin_id instead of MongoDB _id
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
  const { pinId, lat, lng } = req.body; // pinId is now custom string like "parade_ground"
  const team = req.user;
  const Team = require('../models/Team.js');
  
  // Check if team has reached penalty limit
  if (team.gameState.penalties >= 20) {
    return res.status(403).json({ 
      message: "Maximum penalties reached. You cannot submit anymore.", 
      penalties: team.gameState.penalties 
    });
  }
  
  // Find pin by custom pin_id
  const pin = await Pin.findOne({ pin_id: pinId });
  if (!pin) {
    return res.status(404).json({ message: "Pin not found" });
  }

  // Check distance
  const dist = haversineMeters(lat, lng, pin.location.coordinates[1], pin.location.coordinates[0]);
  if (dist > 5000) {
    return res.status(400).json({ message: "You are too far from this location!" });
  }

  // Get current hint
  const currentHint = await Hint.findOne({ hint_id: team.gameState.currentHintId });
  if (!currentHint) {
    return res.status(404).json({ message: "No active hint found" });
  }

  // Check if the submitted pin is correct for current hint
  const isCorrect = currentHint.correctPins.includes(pin.pin_id);
  
  if (!isCorrect) {
    // Wrong answer - add penalty
    team.gameState.penalties += 1;
    await team.save();
    
    const penaltyWarning = team.gameState.penalties >= 15
      ? "\n\n⚠️ Warning: Close to maximum penalties!"
      : "";
    
    return res.json({
      success: false,
      message: `❌ Incorrect answer! ${pin.name} is not the right location.`,
      penalties: team.gameState.penalties,
      currentHintId: team.gameState.currentHintId,
      completedHints: team.gameState.completedHints || []
    });
  }
  
  // Correct answer!
  team.gameState.completedHints = team.gameState.completedHints || [];
  team.gameState.completedHints.push(currentHint.hint_id);
  team.gameState.lastHintSubmittedAt = new Date();
  
  // Check if this was the final hint
  if (currentHint.isFinalHint) {
    await team.save();
    return res.json({
      success: true,
      gameCompleted: true,
      message: `🎉 CONGRATULATIONS! You've completed the treasure hunt!`,
      penalties: team.gameState.penalties,
      completedHints: team.gameState.completedHints,
      totalHints: team.gameState.completedHints.length
    });
  }
  
  // Move to next hint (use pin's unlocksHintId if available, otherwise sequential)
  const nextHintId = pin.unlocksHintId || (currentHint.hint_id + 1);
  const nextHint = await Hint.findOne({ hint_id: nextHintId });
  
  if (!nextHint) {
    // No more hints - check if all regular hints are complete, unlock final
    const totalRegularHints = await Hint.countDocuments({ isFinalHint: false });
    if (team.gameState.completedHints.length >= totalRegularHints) {
      const finalHint = await Hint.findOne({ isFinalHint: true });
      if (finalHint) {
        team.gameState.currentHintId = finalHint.hint_id;
        await team.save();
        
        return res.json({
          success: true,
          message: `🎯 Amazing! Final hint unlocked!`,
          penalties: team.gameState.penalties,
          currentHintId: finalHint.hint_id,
          completedHints: team.gameState.completedHints,
          nextHint: finalHint,
          finalUnlocked: true
        });
      }
    }
  }
  
  team.gameState.currentHintId = nextHintId;
  await team.save();
  
  return res.json({
    success: true,
    message: `✅ Correct! Moving to next hint...`,
    penalties: team.gameState.penalties,
    currentHintId: nextHintId,
    completedHints: team.gameState.completedHints,
    nextHint: nextHint
  });
};

// Handle wrong answers (penalty system removed from new design, but keep for compatibility)
// In the new design, there are no "wrong" answers - just visited/not visited locations

// Leaderboard: return teams with name, current hint index, score, penalties and last submission time
const getLeaderboard = async (req, res) => {
  try {
    // Check cache first (10 second TTL)
    const cache = req.app.locals.getLeaderboardCache();
    if (cache.data && (Date.now() - cache.timestamp) < 10000) {
      return res.json(cache.data);
    }

    // Sort by: hints completed (desc), then penalties (asc), then time (asc)
    const teams = await require('../models/Team.js')
      .find({}, { 
        name: 1, 
        'gameState.currentHintId': 1,
        'gameState.completedHints': 1,
        'gameState.penalties': 1,
        'gameState.lastHintSubmittedAt': 1 
      })
      .lean();

    // Sort manually
    const sorted = teams.sort((a, b) => {
      const aHints = a.gameState?.completedHints?.length || 0;
      const bHints = b.gameState?.completedHints?.length || 0;
      
      if (bHints !== aHints) return bHints - aHints; // More hints = higher rank
      
      const aPenalties = a.gameState?.penalties || 0;
      const bPenalties = b.gameState?.penalties || 0;
      
      if (aPenalties !== bPenalties) return aPenalties - bPenalties; // Fewer penalties = higher rank
      
      // Earlier completion time = higher rank
      const aTime = a.gameState?.lastHintSubmittedAt ? new Date(a.gameState.lastHintSubmittedAt).getTime() : Infinity;
      const bTime = b.gameState?.lastHintSubmittedAt ? new Date(b.gameState.lastHintSubmittedAt).getTime() : Infinity;
      
      return aTime - bTime;
    }).slice(0, 50);

    const payload = sorted.map(t => ({
      name: t.name,
      currentHintId: t.gameState?.currentHintId ?? 1,
      hintsCompleted: t.gameState?.completedHints?.length ?? 0,
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
  const totalHints = await Hint.countDocuments({ isFinalHint: false });
  
  res.json({
    currentHintId: gameState.currentHintId || 1,
    completedHints: gameState.completedHints || [],
    hintsCompleted: (gameState.completedHints || []).length,
    penalties: gameState.penalties || 0,
    totalHints: totalHints,
    lastHintSubmittedAt: gameState.lastHintSubmittedAt
  });
};

module.exports = { getHint, submitAnswer, getState, getLeaderboard, getNearbyPins };
