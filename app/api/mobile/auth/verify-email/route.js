// app/api/auth/verify-email/route.js
import { NextResponse } from "next/server";
import User from "@/models/User";
import connectDB from "@/lib/db";

export async function POST(req) {
  await connectDB();
  const { token } = await req.json();

  const user = await User.findOne({
    emailVerifyToken: token,
    emailVerifyExpires: { $gt: Date.now() },
  });

  if (!user) {
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
  }

  user.emailVerified = true;
  user.emailVerifyToken = undefined;
  user.emailVerifyExpires = undefined;
  await user.save();

  return NextResponse.json({ message: "Your email has been verified successfully." });
}
