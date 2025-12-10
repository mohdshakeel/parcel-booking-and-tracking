import { NextResponse } from "next/server";
//import bcrypt from "bcryptjs";
import User from "@/models/User";
import connectDB from "@/lib/db";

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

    const user = await User.create({
      name,
      email,
      phone,
      role: "user",
      password,
    });

    return NextResponse.json(
      { message: "User registered successfully", user, success: true },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error: error.message,success: false},
      { status: 500 }
    );
  }
}
