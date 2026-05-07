import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Parcel from "@/models/Parcel";
import jwt from "jsonwebtoken";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization",
};

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: corsHeaders,
  });
}

export async function GET(req) {
  try {

    await connectDB();

    // Get token from Authorization header
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const userId = decoded.id;
    const userRole = decoded.role;

    const { searchParams } = new URL(req.url);

    const page = parseInt(
      searchParams.get("page") || "1"
    );

    const limit = parseInt(
      searchParams.get("limit") || "10"
    );

    const search =
      searchParams.get("search") || "";

    const status =
      searchParams.get("status") || "All";

    const sort =
      searchParams.get("sort") || "createdAt";

    const query = {
      ...(userRole !== "admin" && { userId }),

      ...(status !== "All" && { status }),

      ...(search && {
        $or: [
          {
            orderId: {
              $regex: search,
              $options: "i",
            },
          },
          {
            company: {
              $regex: search,
              $options: "i",
            },
          },
          {
            route: {
              $regex: search,
              $options: "i",
            },
          },
        ],
      }),
    };

    const total =
      await Parcel.countDocuments(query);

    const parcels = await Parcel.find(query)
      .sort({ [sort]: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json(
      {
        data: parcels,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
      {
        headers: corsHeaders,
      }
    );

  } catch (error) {

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}