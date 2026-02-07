import mongoose from "mongoose";

const HubSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    phone: String,

    address: {
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },

    geo: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },

    // 🔗 RELATIONS
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true, // one manager only
    },

    deliveryAgents: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],

    drivers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],

    vehicles: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" }
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

HubSchema.index({ geo: "2dsphere" });

export default mongoose.models.Hub || mongoose.model("Hub", HubSchema);
