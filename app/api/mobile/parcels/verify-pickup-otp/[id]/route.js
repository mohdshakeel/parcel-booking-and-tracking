// app/api/parcels/verify-pickup-otp/[id]/route.js

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Parcel from "@/models/Parcel";
import OtpLog from "@/models/OtpLog";

const MAX_ATTEMPTS = 5;
const BLOCK_MINUTES = 15;

export async function POST(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // ==========================
    // Verify JWT
    // ==========================
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

    // ==========================
    // Request Body
    // ==========================
    const { otp } = await request.json();

    if (!otp) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP is required.",
        },
        { status: 400 }
      );
    }

    // ==========================
    // Find Parcel
    // ==========================
    const parcel = await Parcel.findById(id);

    if (!parcel) {
      return NextResponse.json(
        {
          success: false,
          message: "Parcel not found.",
        },
        { status: 404 }
      );
    }

    // ==========================
    // Verify Assignment
    // ==========================
    const assignment = parcel.assignments.find(
      (a) =>
        a.userId.toString() === decoded.id &&
        a.type === "pickup"
    );

    if (!assignment) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not assigned for this pickup.",
        },
        { status: 403 }
      );
    }

    // ==========================
    // OTP Exists?
    // ==========================
    if (!parcel.pickupOtp || !parcel.pickupOtp.code) {
      return NextResponse.json(
        {
          success: false,
          message: "No active OTP found.",
        },
        { status: 400 }
      );
    }

    // ==========================
    // Already Verified?
    // ==========================
    if (parcel.pickupOtp.verified) {
      return NextResponse.json(
        {
          success: false,
          message: "Pickup already verified.",
        },
        { status: 400 }
      );
    }

    // ==========================
    // Blocked?
    // ==========================
    if (
      parcel.pickupOtp.blockedUntil &&
      new Date(parcel.pickupOtp.blockedUntil) > new Date()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many failed attempts. Try again later.",
        },
        { status: 429 }
      );
    }

    // ==========================
    // OTP Expired?
    // ==========================
    if (
      parcel.pickupOtp.expiresAt &&
      new Date(parcel.pickupOtp.expiresAt) < new Date()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP has expired.",
        },
        { status: 400 }
      );
    }

    // ==========================
    // OTP Match?
    // ==========================
    if (parcel.pickupOtp.code !== otp) {

      parcel.pickupOtp.failedAttempts += 1;

      if (parcel.pickupOtp.failedAttempts >= MAX_ATTEMPTS) {
        parcel.pickupOtp.blockedUntil = new Date(
          Date.now() + BLOCK_MINUTES * 60 * 1000
        );
      }

      await parcel.save();

      await OtpLog.create({
        parcelId: parcel._id,
        userId: decoded.id,
        type: "pickup",
        action: "failed",
        ip:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip"),
        userAgent: request.headers.get("user-agent"),
      });

      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP.",
          attemptsLeft:
            MAX_ATTEMPTS - parcel.pickupOtp.failedAttempts,
        },
        { status: 400 }
      );
    }

    // ==========================
    // OTP Verified
    // ==========================
    parcel.pickupOtp = {
      code: null,
      verified: true,
      generatedAt: null,
      lastSentAt: null,
      expiresAt: null,
      failedAttempts: 0,
      blockedUntil: null,
    };

    parcel.status = "Picked-Up";

    await parcel.save();

    
    return NextResponse.json({
      success: true,
      message: "Pickup verified successfully.",
      status: parcel.status,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}