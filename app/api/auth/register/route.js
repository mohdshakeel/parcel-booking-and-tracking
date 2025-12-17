import { NextResponse } from "next/server";
//import bcrypt from "bcryptjs";
import User from "@/models/User";
import connectDB from "@/lib/db";
import { sendEmail } from "@/lib/mail";
import crypto from "crypto";

export async function POST(req) {
  try {
    await connectDB();

    const { name, email, password,phone } = await req.json();

    if (!name || !email || !password || !phone)
      return NextResponse.json({ message: "All fields are required",success:false }, { status: 400 });

    const userExists = await User.findOne({ email });
    if (userExists)
      return NextResponse.json({ message: "User already exists",success:false }, { status: 400 });

    //const hashedPassword = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email,
      phone,
      role: "user",
      password,
      emailVerifyToken: verifyToken,
      emailVerifyExpires: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
    });
    
    const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verifyToken}`;
    const subject = "Verify Your Email Address";
    await sendEmail({to:email,subject:subject,html:verifyUrl});//send verification email

    return NextResponse.json(
      { message: "User registered successfully. An Verification email has benn sent to your email to activate your account.", user, success: true },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error: error.message,success: false},
      { status: 500 }
    );
  }
}
