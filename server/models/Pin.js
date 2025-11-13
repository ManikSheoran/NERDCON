const mongoose = require("mongoose");

const pinSchema = new mongoose.Schema({
  pin_id: { type: String, required: true, unique: true }, // Custom ID like "parade_ground"
  name: { type: String, required: true },
  location: {
    type: { type: String, default: "Point" },
    coordinates: [Number], // [lng, lat]
  },
  unlocksHintId: { type: Number, default: null }, // Which hint_id this pin unlocks (null for bogus pins)
});

pinSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Pin", pinSchema);
