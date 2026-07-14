// app/api/parcels/verify-delivery-otp/[id]/route.js

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Parcel from "@/models/Parcel";

const MAX_ATTEMPTS = 5;
const BLOCK_MINUTES = 15;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}


export async function POST(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // Verify JWT
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Read Request Body
    const { otp } = await request.json();

    if (!otp) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP is required.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Find Parcel
    const parcel = await Parcel.findById(id);

    if (!parcel) {
      return NextResponse.json(
        {
          success: false,
          message: "Parcel not found.",
        },
        { status: 404, headers: corsHeaders }
      );
    }

    // Verify Assignment
    const assignment = parcel.assignments.find(
      (a) =>
        a.userId.toString() === decoded.id &&
        a.type === "delivery"
    );

    if (!assignment) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not assigned for this delivery.",
        },
        { status: 403, headers: corsHeaders }
      );
    }

    // Check OTP Exists
    if (!parcel.deliveryOtp || !parcel.deliveryOtp.code) {
      return NextResponse.json(
        {
          success: false,
          message: "No active OTP found.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Already Verified
    if (parcel.deliveryOtp.verified) {
      return NextResponse.json(
        {
          success: false,
          message: "Delivery already verified.",
        },
        { status: 400 }
      );
    }

    // Check Blocked
    if (
      parcel.deliveryOtp.blockedUntil &&
      new Date(parcel.deliveryOtp.blockedUntil) > new Date()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many failed attempts. Try again later.",
        },
        { status: 429, headers: corsHeaders }
      );
    }

    // Check Expiry
    if (
      parcel.deliveryOtp.expiresAt &&
      new Date(parcel.deliveryOtp.expiresAt) < new Date()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP has expired.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Invalid OTP
    if (parcel.deliveryOtp.code !== otp) {
      parcel.deliveryOtp.failedAttempts += 1;

      if (parcel.deliveryOtp.failedAttempts >= MAX_ATTEMPTS) {
        parcel.deliveryOtp.blockedUntil = new Date(
          Date.now() + BLOCK_MINUTES * 60 * 1000
        );
      }

      await parcel.save();

      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP.",
          attemptsLeft: Math.max(
            0,
            MAX_ATTEMPTS - parcel.deliveryOtp.failedAttempts
          ),
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // OTP Verified
    parcel.deliveryOtp = {
      code: null,
      verified: true,
      generatedAt: null,
      lastSentAt: null,
      expiresAt: null,
      failedAttempts: 0,
      blockedUntil: null,
    };

    // Update status according to your schema
    parcel.status = "Delivered";

    await parcel.save();

    return NextResponse.json({
      success: true,
      message: "Delivery verified successfully.",
      status: parcel.status,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}