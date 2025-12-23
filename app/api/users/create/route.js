import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { sendEmail } from "@/lib/mail";
import crypto from "crypto";
//import bcrypt from "bcryptjs";

/**
 * Generate secure temporary password
 */
function generateTempPassword(length = 10) {
  return crypto
    .randomBytes(length)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, length);
}

export async function POST(req) {
  try {
    await connectDB();

    const {
      name,
      email,
      phone,
      address,
    } = await req.json();

    // Validation
    if (
      !name ||
      !email ||
      !phone ||
      !address?.street ||
      !address?.city ||
      !address?.zipcode ||
      !address?.country
    ) {
      return NextResponse.json(
        { message: "All fields are required", success: false },
        { status: 400 }
      );
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists", success: false },
        { status: 400 }
      );
    }

    // Generate temp password
    const tempPassword = generateTempPassword(10);
    //const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Email verification token
    const emailVerifyToken = crypto.randomBytes(32).toString("hex");

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: tempPassword,
      role: "user",

      address: {
        street: address.street,
        city: address.city,
        state: address.state || "",
        zipcode: address.zipcode,
        country: address.country,
      },

      isEmailVerified: false,
      mustChangePassword: true, // 🔐 important
      emailVerifyToken,
      emailVerifyExpires: Date.now() + 24 * 60 * 60 * 1000,
    });

    // Email content
    const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${emailVerifyToken}`;

    await sendEmail({
      to: email,
      subject: "Your account has been created",
      html: `
        <p>Hello ${name},</p>
        <p>Your account has been created by our team.</p>

        <p><strong>Temporary Password:</strong> ${tempPassword}</p>

        <p>Please verify your email and login using this password.</p>

        <a href="${verifyUrl}">Verify Email</a>

        <p>You will be required to change your password after login.</p>
      `,
    });

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully. Temporary password sent by email.",
        userId: user._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
