
import { NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";

import connectDB from "@/lib/mongodb";
import Parcel from "@/models/Parcel";
import ParcelOTP from "@/models/ParcelOTP";
import {
  getBearerUser,
  hashOtp,
  otpHashesMatch,
  normalizePurpose,
} from "@/lib/parcel-otp";

export const runtime = "nodejs";

export async function POST(request) {
  let session;

  try {
    const user = getBearerUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { parcelId, otp } = body;
    const purpose = normalizePurpose(body.purpose);

    if (
      !Types.ObjectId.isValid(parcelId || "") ||
      !purpose ||
      typeof otp !== "string" ||
      !/^\d{6}$/.test(otp)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid parcelId, purpose and six-digit OTP are required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    if (!process.env.OTP_SECRET) {
      return NextResponse.json(
        { success: false, message: "OTP service is not configured" },
        { status: 500 }
      );
    }

    const parcel = await Parcel.findById(parcelId).lean();

    if (!parcel) {
      return NextResponse.json(
        { success: false, message: "Parcel not found" },
        { status: 404 }
      );
    }

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

    const expectedStatus =
      purpose === "pickup" ? "Booked" : "Out For Delivery";

    const newStatus =
      purpose === "pickup" ? "Picked-Up" : "Delivered";

    if (parcel.status !== expectedStatus) {
      return NextResponse.json(
        {
          success: false,
          message: `Parcel must be in ${expectedStatus} status`,
        },
        { status: 409 }
      );
    }

    // First check the OTP to avoid opening a transaction
    // for an obviously invalid code.
    const record = await ParcelOTP.findOne({
      parcelId,
      purpose,
    }).lean();

    if (
      !record ||
      record.verifiedAt ||
      record.expiresAt <= new Date()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP is invalid or expired. Request a new OTP.",
        },
        { status: 400 }
      );
    }

    if (record.attempts >= 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Maximum OTP attempts reached. Request a new OTP.",
        },
        { status: 429 }
      );
    }

    const submittedHash = hashOtp(otp, parcelId, purpose);

    if (!otpHashesMatch(otp, record.otpHash, parcelId, purpose)) {
      // Increment atomically; concurrent wrong attempts cannot
      // increment the counter beyond the limit.
      await ParcelOTP.updateOne(
        {
          _id: record._id,
          verifiedAt: null,
          expiresAt: { $gt: new Date() },
          attempts: { $lt: 5 },
        },
        { $inc: { attempts: 1 } }
      );

      return NextResponse.json(
        {
          success: false,
          message: "Incorrect OTP",
        },
        { status: 400 }
      );
    }

    // Transactions require MongoDB running as a replica set
    // or a supported sharded cluster.
    session = await mongoose.startSession();

    let result = null;

    await session.withTransaction(async () => {
      const currentOtp = await ParcelOTP.findOne({
        _id: record._id,
        verifiedAt: null,
        expiresAt: { $gt: new Date() },
        attempts: { $lt: 5 },
      }).session(session);

      if (
        !currentOtp ||
        currentOtp.otpHash !== submittedHash
      ) {
        result = "otp_unavailable";
        return;
      }

      const parcelFilter = {
        _id: parcelId,
        status: expectedStatus,
      };

      // Recheck assignment and status in the same transaction.
      if (!isAdmin) {
        parcelFilter.assignedAgentId = user.id;
      }

      const updatedParcel = await Parcel.findOneAndUpdate(
        parcelFilter,
        { $set: { status: newStatus } },
        { new: true, session }
      );

      if (!updatedParcel) {
        result = "parcel_changed";
        return;
      }

      const consumedOtp = await ParcelOTP.updateOne(
        {
          _id: currentOtp._id,
          verifiedAt: null,
          expiresAt: { $gt: new Date() },
          attempts: { $lt: 5 },
        },
        { $set: { verifiedAt: new Date() } },
        { session }
      );

      if (consumedOtp.modifiedCount !== 1) {
        // Throwing aborts the transaction, including the status update.
        throw new Error("OTP_CONSUMPTION_FAILED");
      }

      result = "verified";
    });

    if (result === "otp_unavailable") {
      return NextResponse.json(
        {
          success: false,
          message: "OTP expired, already used, or attempt limit reached",
        },
        { status: 400 }
      );
    }

    if (result === "parcel_changed") {
      return NextResponse.json(
        {
          success: false,
          message: "Parcel status changed. Refresh and try again.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${purpose === "pickup" ? "Pickup" : "Delivery"} verified successfully`,
      status: newStatus,
    });
  } catch (error) {
    console.error("Verify OTP error:", error.message);

    return NextResponse.json(
      { success: false, message: "Unable to verify OTP" },
      { status: 500 }
    );
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}
