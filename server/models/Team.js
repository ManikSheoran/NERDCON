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
    // Track which hints have been fully completed (all pins found)
    completedHints: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hint" }],
    // Track which pins have been correctly submitted for each hint
    // Format: [{ hintId: ObjectId, pinId: ObjectId }]
    submittedPins: [{
      hintId: { type: mongoose.Schema.Types.ObjectId, ref: "Hint" },
      pinId: { type: mongoose.Schema.Types.ObjectId, ref: "Pin" },
      submittedAt: { type: Date, default: Date.now }
    }]
  },
});

module.exports = mongoose.model("Team", teamSchema);
