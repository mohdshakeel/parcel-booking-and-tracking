import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";

export async function POST(req) {
  

  try {
    await connectDB();
    const { token, password } = await req.json();
    const decoded = jwt.verify(token, process.env.RESET_TOKEN_SECRET);

    const hashed = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(decoded.id, { password: hashed });

    return NextResponse.json({ message: "Password reset successful" });
  } catch (err) {
    return NextResponse.json({ message: "Invalid or expired token",error:err.message }, { status: 400 });
  }
}
