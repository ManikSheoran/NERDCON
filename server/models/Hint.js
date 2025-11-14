const mongoose = require("mongoose");

const hintSchema = new mongoose.Schema({
  hint_id: { type: Number, required: true, unique: true },
  folderName: { type: String, required: true },
  intel: { type: String, default: "" }, // Additional hint text (costs 2 penalties to unlock)
  correctPins: [{ type: String }],
  isFinalHint: { type: Boolean, default: false },
});

module.exports = mongoose.model("Hint", hintSchema);
