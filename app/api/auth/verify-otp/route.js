import { NextResponse } from "next/server";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";

export async function POST(req) {
  try {
  await connectDB();

  const { email, otp } = await req.json();

  const user = await User.findOne({ email });
  if (!user || user.otp !== otp)
    return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });

  if (user.otpExpiry < Date.now())
    return NextResponse.json({ message: "OTP expired" }, { status: 400 });

  // Clear OTP
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

  const response = NextResponse.json({ message: "OTP Verified" });
  response.cookies.set("token", token, { httpOnly: true, path: "/" });

  return response;
}catch (error) {
    return NextResponse.json(
      { message: "Error in verifying OTP", error: error.message },
      { status: 500 }
    );
  } 
}
