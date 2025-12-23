import connectDB from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const drivers = await User.find({ role: "driver" })
    .select("_id name phone");

  return NextResponse.json(drivers);
}
