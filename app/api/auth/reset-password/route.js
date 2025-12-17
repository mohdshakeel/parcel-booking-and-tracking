import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import connectDB from "@/lib/db";

export async function POST(req) {
  

  try {
    await connectDB();
    const { token, password,confirmPassword } = await req.json();
    if (password !== confirmPassword) {
      return Response.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);

    const hashed = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(decoded.id, { password: hashed });

    return NextResponse.json({ message: "Password reset successful" });
  } catch (err) {
    return NextResponse.json({ message: "Invalid or expired token",error:err.message }, { status: 400 });
  }
}
