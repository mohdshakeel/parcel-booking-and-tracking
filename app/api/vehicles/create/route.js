import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Vehicle from "@/models/Vehicle";

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const driverId = formData.get("driverId");
    const data = {
      vehicleNumber: formData.get("vehicleNumber"),
      vehicleType: formData.get("vehicleType"),
      capacityKg: formData.get("capacityKg"),
      brand: formData.get("brand"),
      model: formData.get("model"),
      color: formData.get("color"),
      year: formData.get("year"),
      driverId: driverId,
      driverHistory: [
      {
      driverId,
      assignedAt: new Date(),
      },
      ],
    registration: {
      rcNumber: formData.get("regNumber"),
    },
    insurance: {
      policyNumber: formData.get("policyNumber"),
    },
    pollution: {
      pucNumber: formData.get("pucNumber"),
    },

      
    };

    if (!data.vehicleNumber || !data.vehicleType || !data.driverId) {
      return NextResponse.json(
        { success: false, message: "Required fields missing" },
        { status: 400 }
      );
    }

    const vehicle = await Vehicle.create(data);

    return NextResponse.json({
      success: true,
      message: "Vehicle added successfully",
      vehicle,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create vehicle",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
