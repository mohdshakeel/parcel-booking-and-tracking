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
        role: body.role || "manager", // Default to "manager" if not provided
        hubId: body.hubId || null, // ✅ ADD THIS
        address: {
          street: body.address?.street,
          city: body.address?.city,
          state: body.address?.state,
          zipcode: body.address?.zipcode,
          country: body.address?.country,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "Manager not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Manager updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
