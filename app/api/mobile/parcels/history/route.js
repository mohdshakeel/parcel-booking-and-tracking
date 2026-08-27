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
export async function GET(request) {
  try {
    // ==========================================
    // CONNECT DATABASE
    // ==========================================

    await connectDB();

    // ==========================================
    // GET AUTHORIZATION TOKEN
    // ==========================================

    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          message: "Authorization token is required",
        },
        { status: 401, headers: corsHeaders }
      );
    }

    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid authorization format",
        },
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Token is missing",
        },
        { status: 401, headers: corsHeaders }
      );
    }

    // ==========================================
    // VERIFY TOKEN
    // ==========================================

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
        },
        { status: 401, headers: corsHeaders }
      );
    }

    // ==========================================
    // GET USER ID
    // ==========================================

    const userId = decoded.id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID not found in token",
        },
        { status: 401, headers: corsHeaders }
      );
    }

    // ==========================================
    // GET STATUS FROM QUERY
    // ==========================================

    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");

    // ==========================================
    // ALLOWED STATUSES
    // ==========================================

    const allowedStatuses = [
      "Picked-Up",
      "Out For Delivery",
      "Delivered",
      "Processing",
    ];

    // ==========================================
    // BUILD QUERY
    // ==========================================

    const query = {
      userId: userId,
    };

    // ==========================================
    // FILTER BY STATUS
    // ==========================================

    if (status) {
      // Multiple statuses:
      //
      // ?status=Delivered,In-Transit
      //
      const requestedStatuses = status
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      // Check invalid statuses
      const invalidStatuses = requestedStatuses.filter(
        (item) => !allowedStatuses.includes(item)
      );

      if (invalidStatuses.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid parcel status",
            invalidStatuses,
            allowedStatuses,
          },
          { status: 400, headers: corsHeaders }
        );
      }

      // One status
      if (requestedStatuses.length === 1) {
        query.status = requestedStatuses[0];
      }

      // Multiple statuses
      if (requestedStatuses.length > 1) {
        query.status = {
          $in: requestedStatuses,
        };
      }
    }

    // ==========================================
    // GET PARCELS
    // ==========================================

    const parcels = await Parcel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // ==========================================
    // RESPONSE
    // ==========================================

    return NextResponse.json(
      {
        success: true,

        userId,

        status: status || "ALL",

        count: parcels.length,

        parcels,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("GET PARCELS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch parcels",
        error: error.message,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}