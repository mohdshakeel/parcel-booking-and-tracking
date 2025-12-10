import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {

  await connectDB();

  const { email, password } = await req.json();
  const user = await User.findOne({ email }).select("+password");;

  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return NextResponse.json({ error: "Invalid password" }, { status: 400 });
  }

console.log("User authenticated:", user.email);
  
  const token = signToken({ id: user._id, email: user.email});

  const response = NextResponse.json({
  message: "Login successful",
  success: true,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
 });

response.cookies.set("role", user.role, {
  httpOnly: true, // you need readable on frontend
  secure: process.env.NODE_ENV === "production",
  path: "/",
  sameSite: "strict",
  maxAge: 60 * 60 * 24 * 7 // 7 days
 });
 


response.cookies.set("token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

  return response;
  } catch (error) {
    return NextResponse.json(
      { error: error.message+"Login failed" },
      { status: 500 }
    );
  }

}
