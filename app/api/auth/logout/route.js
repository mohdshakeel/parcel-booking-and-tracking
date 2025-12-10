import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true , message: "Logged out successfully" });

  // Clear token cookie
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("role", "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });



  return response;
}
