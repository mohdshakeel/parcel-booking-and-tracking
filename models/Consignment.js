const ConsignmentSchema = new mongoose.Schema({
  consignmentNumber: { type: String, unique: true },

  sourceHub: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hub",
    required: true,
  },

  destinationHub: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hub",
    required: true,
  },

  parcels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Parcel",
  }],

  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
  },

  eta: Date,

  status: {
    type: String,
    enum: ["CREATED", "ASSIGNED","IN_TRANSIT", "COMPLETED"],
    default: "CREATED",
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  createdAt: { type: Date, default: Date.now },
});
export default mongoose.models.Parcel || mongoose.model("Consignment", ConsignmentSchema);