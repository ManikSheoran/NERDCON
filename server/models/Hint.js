const mongoose = require("mongoose");

const hintSchema = new mongoose.Schema({
  text: String,
  scoreValue: { type: Number, default: 100 },
  correctPin: { type: mongoose.Schema.Types.ObjectId, ref: "Pin" },
});

module.exports = mongoose.model("Hint", hintSchema);
