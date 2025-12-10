import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";


export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false,message:'No Token' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    return NextResponse.json({
      authenticated: true,
      user: decoded,
      message: "User authenticated"
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false , message:"Invalid Token - "+error.message}, { status: 401 });
  }
}

