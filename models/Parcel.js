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
      enum: ["Booked","Picked-Up","At Hub","In-Transit","Out For Delivery","Delivered", "Pending", "Processing"],
      default: "Booked",
    },
  size: String,
  trackingId: {
  type: String,
  unique: true,
  index: true,
},
sourceHubId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Hub",
  required: true
},

destinationHubId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Hub",
  required: true
},
consignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Consignment",
    default: null,
},

userId:String,

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Parcel || mongoose.model("Parcel", ParcelSchema);
