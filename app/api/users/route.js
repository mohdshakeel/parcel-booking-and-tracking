import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Hub from "@/models/Hub";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status") || "All";
    const role = searchParams.get("role");
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    const skip = (page - 1) * limit;

    let query = {};

    /* ---------------- STATUS FILTER ---------------- */
    if (status === "Verified") {
      query.emailVerified = true;
    }

    if (status === "Active") {
      query.isActive = true;
    }

    if (status === "Inactive") {
      query.isActive = false;
    }

    if (!role) {
  query.role = "user"; // 👈 default role
}else{
  query.role = role;
}

    /* ---------------- SEARCH FILTER ---------------- */
    if (search) {
      const regex = new RegExp(search, "i");

      query.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },

        // New address object
        { "address.street": regex },
        { "address.city": regex },
        { "address.zipcode": regex },
        { "address.country": regex },

        // Old flat fields (backward compatibility)
        { address: regex },
        { city: regex },
        { zipCode: regex },
        { country: regex },

        // Search by Mongo ID
        ...(mongoose.Types.ObjectId.isValid(search)
          ? [{ _id: search }]
          : []),
      ];
    }

    /* ---------------- FETCH DATA ---------------- */
    const [users, totalCount] = await Promise.all([
      User.find(query)
        .populate("hubId", "name") // Populate hub name
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      users,
      totalPages,
      totalCount,
      page,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
