import mongoose from "mongoose";

const TrackingSchema = new mongoose.Schema({
  trackingId: String,
  status: String,       // e.g. "In Transit", "Delivered"
  location: String,
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Tracking || mongoose.model("Tracking", TrackingSchema);
