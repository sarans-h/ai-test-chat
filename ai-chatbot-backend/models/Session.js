const mongoose = require("mongoose")

const sessionSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  roomId: String,
  chatHistory: [{
    role: String,
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  metadata: {
    purchaseStage: String,
    needsRepresentative: Boolean,
    lastInteraction: Date,
    preferences: Map
  }
}, { timestamps: true })

module.exports = mongoose.model("Session", sessionSchema)
