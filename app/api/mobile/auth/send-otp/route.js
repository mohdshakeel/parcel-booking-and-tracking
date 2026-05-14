import { NextResponse } from "next/server";
import User from "@/models/User";
import connectDB from "@/lib/db";

export async function POST(req) {
  try{
  await connectDB();

  const { email } = await req.json();
  const user = await User.findOne({ email });

  if (!user)
    return NextResponse.json({ message: "Email not found" }, { status: 404 });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.otp = otp;
  user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
  await user.save();

  console.log("OTP =>", otp);

  return NextResponse.json({ message: "OTP sent to email" });
}catch (error) {
    return NextResponse.json(
      { message: "Error in sending OTP", error: error.message },  
      { status: 500 }       

    );
  } 

}