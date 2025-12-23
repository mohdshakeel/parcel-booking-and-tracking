import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    /*address: String,
    country: String,
    state_region: String,
    city: String,
    zipCode: String,
    */
    address: {
     street: String,
     city: String,
     state: String,
     zipcode: String,
     country: String,
     },
    profileImage: String,
    role: {
      type: String,
      enum: ["user", "admin","manager","driver"],
      default: "user",
    },
    emailVerified: { type: Boolean, default: false },
    mustChangePassword : { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    emailVerifyToken: String,
    emailVerifyExpires: Date,
  },
  { timestamps: true }
);

UserSchema.index({
  name: "text",
  email: "text",
  phone: "text",
  "address.street": "text",
  "address.city": "text",
  "address.zipcode": "text",
  "address.country": "text",
});


// Hash password before save
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
