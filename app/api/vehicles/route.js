import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Vehicle from "@/models/Vehicle";

export async function GET() {
  await connectDB();

  const vehicles = await Vehicle.find()
    .populate("driverId", "name phone");

  return NextResponse.json(vehicles);
}

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();

    const vehicle = await Vehicle.create({
      vehicleNumber: data.vehicleNumber,
      vehicleType: data.vehicleType,
      capacity: data.capacity,
      driverId: data.driverId || null,
      status: "available",
    });

    return NextResponse.json(
      { message: "Vehicle added successfully", vehicle },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
