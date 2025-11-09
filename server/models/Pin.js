const mongoose = require("mongoose");

const pinSchema = new mongoose.Schema({
  pin_id: { type: Number, required: true, unique: true }, // Easy reference ID
  name: String,
  location: {
    type: { type: String, default: "Point" },
    coordinates: [Number], // [lng, lat]
  },
});

pinSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Pin", pinSchema);
