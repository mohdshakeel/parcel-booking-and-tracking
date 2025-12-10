import mongoose from "mongoose";

const ParcelSchema = new mongoose.Schema({
  senderName: String,
  senderPhone: String,
  senderAddress: String,

  receiverName: String,
  receiverPhone: String,
  receiverAddress: String,

  parcelType: String,
  weight: Number,
  price: Number,

  trackingId: String,

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Parcel || mongoose.model("Parcel", ParcelSchema);
