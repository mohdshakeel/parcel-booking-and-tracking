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
  status: {
      type: String,
      enum: ["Booked","Picked-Up","In-Transit","Out For Delivery","Delivered", "Pending", "Processing"],
      default: "Booked",
    },
  size: String,
  trackingId: {
  type: String,
  unique: true,
  index: true,
},
  userId:String,

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Parcel || mongoose.model("Parcel", ParcelSchema);
