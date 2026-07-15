import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Parcel from "@/models/Parcel";
import { sendEmail } from "@/lib/mail"; // Your email helper
//import { sendSMS } from "@/lib/sendSMS"; // Your SMS helper (optional)



const OTP_EXPIRY_MINUTES = 10;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request,{ params }) {
  try {
    await connectDB();

    const { id } = await params;

    // ==========================
    // Get JWT Token
    // ==========================
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ==========================
    // Find Parcel
    // ==========================
    const parcel = await Parcel.findById(id);

    if (!parcel) {
      return NextResponse.json(
        { success: false, message: "Parcel not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    // ==========================
    // Check Assignment
    // ==========================
    const assignment = parcel.assignments.find(
      (a) =>
        a.userId.toString() === decoded.id &&
        a.type === "pickup"
    );

    if (!assignment) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not assigned for pickup."
        },
        { status: 403, headers: corsHeaders }
      );
    }

    // ==========================
    // Prevent Duplicate OTP
    // ==========================
    if (
      parcel.pickupOtp &&
      parcel.pickupOtp.verified === false &&
      parcel.pickupOtp.expiresAt &&
      new Date(parcel.pickupOtp.expiresAt) > new Date()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Pickup OTP already generated."
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // ==========================
    // Generate OTP
    // ==========================
    const otp = generateOTP();

    parcel.pickupOtp = {
      code: otp,
      verified: false,
      expiresAt: new Date(
        Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
      ),
    };

    await parcel.save();

    // ==========================
    // Send Email
    // ==========================
    const user = await User.findById(assignment.userId).select("email phone name");

if (!user) {
  return NextResponse.json(
    {
      success: false,
      message: "User not found.",
    },
    { status: 404, headers: corsHeaders }
  );
}
const email = user.email;
    //const name = user.name;
    if (email) {
      await sendEmail({
        to: email,
        subject: "Pickup Verification OTP",
        html: `
          <h2>Eagle Express</h2>

          <p>Your Pickup OTP is</p>

          <h1>${otp}</h1>

          <p>This OTP will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
        `,
      });
    }

    // ==========================
    // Send SMS (Optional)
    // ==========================
   /* if (parcel.senderPhone) {
      await sendSMS(
        parcel.senderPhone,
        `Your Eagle Express Pickup OTP is ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`
      );
    } */

    return NextResponse.json({
      success: true,
      message: "Pickup OTP sent successfully.",
    },
  
  { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },

  {
    status: 500,
    headers: corsHeaders,
  }
    );
  }
}