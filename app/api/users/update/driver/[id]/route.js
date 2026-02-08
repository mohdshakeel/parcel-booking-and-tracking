import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const { id } = await params;
    const body = await req.json();

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name: body.name,
        email: body.email,
        phone: body.phone,
        hubId: body.hubId,
        vehicleId: body.vehicleId,
        address: body.address,
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "Driver not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Driver updated successfully",
      driver: updatedUser,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
