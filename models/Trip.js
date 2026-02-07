const TripSchema = new mongoose.Schema(
  {
    fromHub: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hub",
      required: true,
    },
    toHub: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hub",
      required: true,
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    consignments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Consignment",
      },
    ],

    eta: Date,

    status: {
      type: String,
      enum: ["CREATED", "IN_TRANSIT", "COMPLETED"],
      default: "CREATED",
    },

    startedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Trip || mongoose.model("Trip", TripSchema);
