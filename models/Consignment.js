import mongoose from "mongoose";

const { Schema } = mongoose;

const ConsignmentSchema = new Schema({
  consignmentNumber: {
    type: String,
    unique: true,
    required: true,
  },

  sourceHub: {
    type: Schema.Types.ObjectId,
    ref: "Hub",
    required: true,
  },

  destinationHub: {
    type: Schema.Types.ObjectId,
    ref: "Hub",
    required: true,
  },

  parcels: [
    {
      type: Schema.Types.ObjectId,
      ref: "Parcel",
    },
  ],

  driver: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  vehicle: {
    type: Schema.Types.ObjectId,
    ref: "Vehicle",
  },

  eta: Date,

  status: {
    type: String,
    enum: ["CREATED", "ASSIGNED", "IN_TRANSIT", "COMPLETED"],
    default: "CREATED",
  },

  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Consignment ||
  mongoose.model("Consignment", ConsignmentSchema);
