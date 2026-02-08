import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await req.json();

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name: body.name,
        email: body.email,
        phone: body.phone,
        role: body.role || "user",
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
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
