import mongoose from "mongoose";  
const VehicleSchema = new mongoose.Schema(
{
 vehicleNumber: { type: String, unique: true, required: true },        // DL01AB1234 (unique)
  vehicleType: String,          // bike, van, truck
  capacityKg: Number,
  capacityVolume: Number,       // optional (cubic cm)

  brand: String,
  model: String,
  year: Number,
  color: String,
  currentTrip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      default: null,
    },

  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User",unique: true, sparse:true,default: null},           // ref: users (role=driver)

  hubId: {type: mongoose.Schema.Types.ObjectId,ref: "Hub",},

   // 📜 DRIVER HISTORY (driver ran many vehicles over time)
  driverHistory: [
    {
      driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      assignedAt: Date,
      unassignedAt: Date
    }
  ],

  registration: {
    rcNumber: String,
    rcExpiry: Date,
    rcDocumentUrl: String
  },

  insurance: {
    provider: String,
    policyNumber: String,
    expiryDate: Date,
    documentUrl: String
  },

  pollution: {
    pucNumber: String,
    expiryDate: Date,
    documentUrl: String
  },

  status: {
    type: String,
    enum: ["Active", "Inactive", "Maintenance"],
    default: "Active"
  },
  

  createdAt: Date,
  updatedAt: Date
},
{ timestamps: true }
);
//VehicleSchema.index({ driverId: 1 }, { unique: true, sparse: true });
VehicleSchema.index({ "registration.rcNumber": 1 }, { unique: true, sparse: true });
VehicleSchema.index({ "insurance.policyNumber": 1 }, { unique: true, sparse: true });
VehicleSchema.index({ "pollution.pucNumber": 1 }, { unique: true, sparse: true });

export default mongoose.models.Vehicle || mongoose.model("Vehicle", VehicleSchema);
