import connectDB from "@/lib/db";
import Parcel from "@/models/Parcel";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(req) {
  try {
    await connectDB();

    import mongoose from "mongoose";
import Parcel from "@/models/Parcel";

export async function GET() {
  // 1. Find all parcels that have assignments
  const parcels = await Parcel.find({ "assignments.0": { $exists: true } });
  
  let updatedCount = 0;

  for (const parcel of parcels) {
    let modified = false;

    // Loop through each assignment in the parcel
    parcel.assignments = parcel.assignments.map((assign) => {
      // Check if userId exists and is stored as a string type
      if (assign.userId && typeof assign.userId === "string") {
        assign.userId = new mongoose.Types.ObjectId(assign.userId);
        modified = true;
      }
      return assign;
    });

    if (modified) {
      await parcel.save();
      updatedCount++;
    }
  }

  return NextResponse.json({ message: `Successfully updated ${updatedCount} parcels.`,headers: corsHeaders });
}


    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    const token = authHeader.split(" ")[1];

   let decoded;

try {
  decoded = jwt.verify(
    token,
    process.env.JWT_SECRET
  );
} catch (err) {
  return NextResponse.json(
    {
      success: false,
      error: "Invalid token",
    },
    {
      status: 401,
      headers: corsHeaders,
    }
  );
}

    const user = await User.findById(decoded.id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",

        },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    if (
      user.role !== "agent" &&
      user.role !== "delivery-agent"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Only agents can access tasks",
        },
        {
          status: 403,
          headers: corsHeaders,
        }
      );
    }
const userId = user._id;
    const parcels = await Parcel.find({
  "assignments.userId": decoded.id,
});

    
    return NextResponse.json(
      {
        success: true,
        count: parcels.length,
        data: parcels,
        test:"This is a test field 5",
        user:userId
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}