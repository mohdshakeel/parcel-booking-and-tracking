import connectDB from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods":
    "GET, POST, PUT, DELETE, OPTIONS",
   "Access-Control-Allow-Headers":
    "Content-Type, Authorization",
};

// PREFLIGHT
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: corsHeaders,
    }
  );
}

// ==========================================
// GET USER
// ==========================================
export async function GET(req, { params }) {
  try {
    await connectDB();

    // TOKEN
    const authHeader =
      req.headers.get("authorization");

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(
      params.id
    ).select("-password");

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

    // USER CAN ONLY ACCESS OWN PROFILE
    if (
      decoded.role !== "admin" &&
      decoded.id !== params.id
    ) {
      return NextResponse.json(
        {
          error:
            "You are not allowed to access this profile",
        },
        {
          status: 403,
          headers: corsHeaders,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user,
      },
      {
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

// ==========================================
// UPDATE USER
// ==========================================
export async function PUT(req, { params }) {
  try {
    await connectDB();

    // TOKEN
    const authHeader =
      req.headers.get("authorization");

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }
//get the token from the header and verify it
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // USER DATA
    const data = await req.json();

    // SECURITY
    if (decoded.id !== params.id) {
      return NextResponse.json(
        {
          error:
            "You are not allowed to update another user profile.", 

        },
        {
          status: 403,
          headers: corsHeaders,
        }
      );
    }

    // UPDATE
    const user =
      await User.findByIdAndUpdate(
        params.id,
        data,
        {
          new: true,
        }
      ).select("-password");

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

    return NextResponse.json(
      {
        success: true,
        message:
          "User updated successfully",
        user,
      },
      {
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

