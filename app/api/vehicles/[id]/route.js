import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Vehicle from "@/models/Vehicle";

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Vehicle id missing in params" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const safeDriverId =
      body.driverId && body.driverId.trim() !== "" ? body.driverId : null;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return NextResponse.json(
        { success: false, message: "Vehicle not found" },
        { status: 404 }
      );
    }

    const oldDriverId = vehicle.driverId ? vehicle.driverId.toString() : null;
    const newDriverId = safeDriverId ? safeDriverId.toString() : null;

    const driverChanged = oldDriverId !== newDriverId;

    // ✅ Build update object
    const updateData = {
      vehicleNumber: body.vehicleNumber,
      vehicleType: body.vehicleType,
      capacityKg: body.capacityKg,
      brand: body.brand,
      model: body.model,
      color: body.color,
      year: body.year,
      driverId: safeDriverId,

      registration: {
        rcNumber: body.registration?.rcNumber,
      },
      insurance: {
        policyNumber: body.insurance?.policyNumber,
      },
      pollution: {
        pucNumber: body.pollution?.pucNumber,
      },
    };

    // ✅ only push driverHistory when driver actually changes
    if (driverChanged && newDriverId) {
      updateData.$push = {
        driverHistory: {
          driverId: newDriverId,
          assignedAt: new Date(),
        },
      };
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return NextResponse.json({
      success: true,
      message: "Vehicle updated successfully",
      vehicle: updatedVehicle,
    });
  } catch (error) {
    console.error("Vehicle update error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update vehicle" },
      { status: 500 }
    );
  }
}



export async function DELETE(req, context) {
  try {
    await connectDB();

    const id = context?.params?.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid vehicle id" },
        { status: 400 }
      );
    }

    const deleted = await Vehicle.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Vehicle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Vehicle deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}
