const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: String,
  gameState: {
    currentHintIndex: { type: Number, default: 0 },
    penalties: { type: Number, default: 0 }, // Total penalties across the game
    score: { type: Number, default: 0 },
    // timestamp of the last hint submission (correct or incorrect)
    lastHintSubmittedAt: { type: Date },
    // Track which hints have been completed (to prevent duplicate scoring)
    completedHints: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hint" }],
  },
});

module.exports = mongoose.model("Team", teamSchema);
