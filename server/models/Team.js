const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: String,
  gameState: {
    currentHintIndex: { type: Number, default: 0 },
    penalties: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    // timestamp of the last hint submission (correct or incorrect)
    lastHintSubmittedAt: { type: Date },
  },
});

module.exports = mongoose.model("Team", teamSchema);
