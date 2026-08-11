import connectDB from "@/lib/db";
import Parcel from "@/models/Parcel";
import jwt from "jsonwebtoken";
import { ulid } from "ulid";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization",
};

// ✅ Handle preflight request
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: corsHeaders,
    }
  );
}

export async function POST(req) {
  try {
    await connectDB();

    // ✅ Get token from header
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    const token = authHeader.split(" ")[1];

    // ✅ Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const userId = decoded.id;

    // ✅ Get request data
    const data = await req.json();

    // ✅ Generate tracking ID
    const trackingId = `TRK-${ulid().toUpperCase()}`;
    const senderAddress = [
  user.address?.street,
  user.address?.city,
  user.address?.zipcode,
  user.address?.state,
  user.address?.country,
]
  .filter(Boolean)
  .join(", ");


    // ✅ Create parcel
    const parcel = await Parcel.create({
      ...data,
      trackingId,
      userId,
      senderName: user.name,
  senderPhone: user.phone,
  senderEmail: user.email,

  senderAddress
});

    return NextResponse.json(
      {
        success: true,
        message: "Parcel booked successfully",
        trackingId,
        parcel,
      },
      {
        status: 201,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Booking failed",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}