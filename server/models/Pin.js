const mongoose = require("mongoose");

const pinSchema = new mongoose.Schema({
  name: String,
  location: {
    type: { type: String, default: "Point" },
    coordinates: [Number], // [lng, lat]
  },
});

pinSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Pin", pinSchema);
