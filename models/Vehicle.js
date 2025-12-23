import mongoose from "mongoose";  
const { ObjectId } = mongoose.Schema.Types;

const VehicleSchema = new mongoose.Schema(


{
  _id: ObjectId,

  vehicleNumber: { type: String, unique: true, required: true },        // DL01AB1234 (unique)
  vehicleType: String,          // bike, van, truck
  capacityKg: Number,
  capacityVolume: Number,       // optional (cubic cm)

  brand: String,
  model: String,
  year: Number,
  color: String,

  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },           // ref: users (role=driver)

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
    enum: ["Active", "Inactive", "Under Maintenance"],
    default: "Active"
  },

  createdAt: Date,
  updatedAt: Date
} ,
{ timestamps: true }
);    
export default mongoose.models.Vehicle || mongoose.model("Vehicle", VehicleSchema);
