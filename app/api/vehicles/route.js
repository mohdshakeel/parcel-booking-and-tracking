import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Vehicle from "@/models/Vehicle";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const dropdown = searchParams.get("dropdown");
    const hubId = searchParams.get("hubId");
    const search = searchParams.get("search") || "";

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    /* -------------------- SEARCH QUERY -------------------- */
    const searchQuery = search
      ? {
          $or: [
            { vehicleNumber: { $regex: search, $options: "i" } },
            { vehicleType: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    /* -------------------- DROPDOWN MODE -------------------- */
    if (dropdown === "true") {
      if (!hubId) {
        return NextResponse.json({
          success: true,
          vehicles: [],
        });
      }

      const vehicles = await Vehicle.find({
        hubId,
        isActive: true,
        ...searchQuery,
      })
        .select("vehicleNumber vehicleType")
        .limit(limit)
        .skip(skip)
        .lean();

      return NextResponse.json({
        success: true,
        vehicles,
      });
    }

    /* -------------------- FULL LIST MODE -------------------- */
    const query = {
      ...searchQuery,
    };

    const [vehicles, total] = await Promise.all([
      Vehicle.find(query)
        .populate("driverId", "name phone")
        .limit(limit)
        .skip(skip)
        .lean(),

      Vehicle.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      vehicles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("GET /api/vehicles error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch vehicles",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
