const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: String,
  gameState: {
    currentHintId: { type: Number, default: 1 }, 
    completedHints: [{ type: Number }], 
    visitedLocations: [{ type: String }], // Track unique pin_ids visited
    unlockedIntels: [{ type: Number }], // Track which hints have intel unlocked
    penalties: { type: Number, default: 0 },
    lastHintSubmittedAt: { type: Date },
  },
});

module.exports = mongoose.model("Team", teamSchema);
