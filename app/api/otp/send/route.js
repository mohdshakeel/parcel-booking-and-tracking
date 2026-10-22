
import { NextResponse } from "next/server";
import { Types } from "mongoose";

import connectDB from "@/lib/mongodb";
import Parcel from "@/models/Parcel";
import ParcelOTP from "@/models/ParcelOTP";
import {
  getBearerUser,
  generateOtp,
  hashOtp,
  normalizePurpose,
} from "@/lib/parcel-otp";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const user = getBearerUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { parcelId } = body;
    const purpose = normalizePurpose(body.purpose);

    if (
      !Types.ObjectId.isValid(parcelId || "") ||
      !purpose
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid parcelId and purpose (pickup or delivery) are required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const parcel = await Parcel.findById(parcelId);

    if (!parcel) {
      return NextResponse.json(
        { success: false, message: "Parcel not found" },
        { status: 404 }
      );
    }

    // Adapt these checks to your Parcel model and assignment rules.
    const isAdmin = user.role === "admin";
    const isAssignedAgent =
      parcel.assignedAgentId &&
      String(parcel.assignedAgentId) === user.id;

    if (!isAdmin && !isAssignedAgent) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized for this parcel",
        },
        { status: 403 }
      );
    }

    // Change these field names if your model uses nested addresses.
    const phoneNumber =
      purpose === "pickup"
        ? parcel.senderPhone
        : parcel.receiverPhone;

    if (!phoneNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Recipient phone number is not available",
        },
        { status: 400 }
      );
    }

    // Enforce the expected parcel state before sending an OTP.
    if (
      purpose === "pickup" &&
      parcel.status !== "Booked"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Parcel is not ready for pickup",
        },
        { status: 409 }
      );
    }

    if (
      purpose === "delivery" &&
      parcel.status !== "Out For Delivery"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Parcel is not out for delivery",
        },
        { status: 409 }
      );
    }

    const username = process.env.SMS_GATE_USERNAME;
    const password = process.env.SMS_GATE_PASSWORD;
    const smsUrl = process.env.SMS_GATE_URL;

    if (
      !username ||
      !password ||
      !smsUrl ||
      !process.env.OTP_SECRET
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP service is not configured",
        },
        { status: 500 }
      );
    }

    // Basic resend cooldown: do not issue another OTP
    // for this parcel/purpose within 60 seconds.
    const existing = await ParcelOTP.findOne({
      parcelId,
      purpose,
    });

    if (
      existing &&
      !existing.verifiedAt &&
      Date.now() - existing.createdAt.getTime() < 60_000
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please wait before requesting another OTP",
        },
        { status: 429 }
      );
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp, parcelId, purpose);
    const expiresAt = new Date(Date.now() + 5 * 60_000);

    // Upsert replaces the previous OTP for this parcel/purpose.
    await ParcelOTP.findOneAndUpdate(
      { parcelId, purpose },
      {
        $set: {
          otpHash,
          expiresAt,
          attempts: 0,
          verifiedAt: null,
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const auth = Buffer.from(
      `${username}:${password}`
    ).toString("base64");

    const smsResponse = await fetch(smsUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        textMessage: {
          text: `Your ${purpose} OTP is ${otp}. It expires in 5 minutes. Do not share it with anyone.`,
        },
        phoneNumbers: [phoneNumber],
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!smsResponse.ok) {
      // Remove only the OTP we just issued.
      await ParcelOTP.deleteOne({
        parcelId,
        purpose,
        otpHash,
      });

      return NextResponse.json(
        {
          success: false,
          message: "SMS delivery request failed",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "OTP request submitted",
        expiresIn: 300,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send OTP error:", error.message);

    return NextResponse.json(
      { success: false, message: "Unable to send OTP" },
      { status: 500 }
    );
  }
}
