import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Parcel from "@/models/Parcel";
import { sendEmail } from "@/lib/mail"; // Your email 
import User from "@/models/User"; // Your User model
import { sendSMS } from "@/lib/parcel-otp"; // Your SMS helper (optional)



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
    // Send Pickup OTP to Sender
    // ==========================
    const senderEmail = parcel.senderEmail;

    if (!senderEmail) {
      parcel.pickupOtp = undefined;
      await parcel.save();

      return NextResponse.json(
        {
          success: false,
          message: "Sender email address not available.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    try {
      await sendEmail({
        to: senderEmail,
        subject: "Pickup Verification OTP",
        html: `
          <h2>Eagle Express</h2>
          <p>Your Pickup OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
          <p>Please do not share this OTP with anyone except the authorized pickup agent.</p>
        `,
      });

      return NextResponse.json(
        {
          success: true,
          message: "Pickup OTP sent successfully to sender.",
          deliveryStatus: {
            email: {
              success: true,
              message: "Email sent successfully.",
            },
          },
        },
        { status: 200, headers: corsHeaders }
      );
    } catch (error) {
      console.error("Pickup OTP email error:", error);

      parcel.pickupOtp = undefined;
      await parcel.save();

      return NextResponse.json(
        {
          success: false,
          message: "Failed to send pickup OTP email.",
          deliveryStatus: {
            email: {
              success: false,
              message: error.message || "Email sending failed.",
            },
          },
        },
        { status: 502, headers: corsHeaders }
      );
    }

    
    


    // ==========================
    // Send SMS (Optional)
    // ==========================
   /* 
   if (parcel.senderPhone) {
      await sendSMS(
        parcel.senderPhone,
        `Your Eagle Express Pickup OTP is ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`
      );
    } 
      */

  
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error"+error.message,
        
      },

  {
    status: 500,
    headers: corsHeaders,
  }
    );
  }
}