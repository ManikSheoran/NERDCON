const mongoose = require("mongoose");

const hintSchema = new mongoose.Schema({
  hint_id: { type: Number, required: true, unique: true },
  imagePath: { type: String, required: true },
  correctPins: [{ type: String }], // Array of custom pin_id strings
  isFinalHint: { type: Boolean, default: false },
});

module.exports = mongoose.model("Hint", hintSchema);
