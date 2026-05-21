import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: corsHeaders,
  });
} 

export async function POST(req) {
  try {

    await connectDB();

    const { email, password } = await req.json();

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return NextResponse.json(
        { error: "Invalid password" },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const token = signToken({
      id: user._id,
      email: user.email,
    });

    const response = NextResponse.json(
  {
    message: "Login successful",
    success: true,
    token,

    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,

      profileImage: user.profileImage
        ? `${process.env.NEXTAUTH_URL}${user.profileImage}`
        : null,

      address: user.address?.street,
      city: user.address?.city,
      state: user.address?.state,
      country: user.address?.country,
      zipCode: user.address?.zipcode,

      phone: user.phone,
    },
  },
  {
    headers: corsHeaders,
  }
);

    response.cookies.set("role", user.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    response.cookies.set("token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;

  } catch (error) {

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}