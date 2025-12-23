import connectDB from "@/lib/db";
import Vehicle from "@/models/Vehicle";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  await connectDB();
  const body = await req.json();

  const vehicle = await Vehicle.findByIdAndUpdate(
    params.id,
    body,
    { new: true }
  );

  return NextResponse.json(vehicle);
}
export async function DELETE(req, { params }) {
  await connectDB();
  await Vehicle.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
