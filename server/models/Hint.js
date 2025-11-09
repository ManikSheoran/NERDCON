const mongoose = require("mongoose");

const hintSchema = new mongoose.Schema({
  hint_id: { type: Number, required: true, unique: true }, // Easy reference ID
  imagePath: { type: String, required: true }, // Path to the hint image
  scoreValue: { type: Number, default: 100 },
  // Support up to 2 correct answers (or 1 for final hint)
  correctPins: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pin" }],
  isFinalHint: { type: Boolean, default: false }, // Marks the final hint
});

module.exports = mongoose.model("Hint", hintSchema);
