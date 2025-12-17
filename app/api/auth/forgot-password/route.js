import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import connectDB from "@/lib/db";
import { sendEmail } from "@/lib/mail";

export async function POST(req) {
  try {
  await connectDB();
  const { email } = await req.json();

  const user = await User.findOne({ email });
  if (!user)
    return NextResponse.json({ message: "Email not found" }, { status: 400 });

  const resetToken = jwt.sign(
    { id: user._id },
    process.env.NEXTAUTH_SECRET,
    { expiresIn: "15m" }
  );

  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
  const subject = "Reset Your Password- Eagle Parcel Book and Track";
      await sendEmail({to:email,subject:subject,html:resetLink});//send verification email
  

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