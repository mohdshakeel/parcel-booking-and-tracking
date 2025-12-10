import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import connectDB from "@/lib/db";

export async function POST(req) {
  try {
  await connectDB();
  const { email } = await req.json();

  const user = await User.findOne({ email });
  if (!user)
    return NextResponse.json({ message: "Email not found" }, { status: 400 });

  const resetToken = jwt.sign(
    { id: user._id },
    process.env.RESET_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const resetLink = `${process.env.NEXT_PUBLIC_URL}/reset-password?token=${resetToken}`;

  // send email (pseudo)
  console.log("RESET LINK =>", resetLink);

  return NextResponse.json({ message: "Reset link sent to email" });
}catch (error) {
    return NextResponse.json(
      { message: "Error in sending reset link", error: error.message },
      { status: 500 }
    );
  }
}