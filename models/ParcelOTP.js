import mongoose from "mongoose";

const ParcelOTPSchema = new mongoose.Schema(
  {
    parcelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parcel",
      required: true,
    },
    purpose: {
      type: String,
      enum: ["pickup", "delivery","verification"],
      required: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

ParcelOTPSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export default mongoose.models.ParcelOTP ||
  mongoose.model("ParcelOTP", ParcelOTPSchema);