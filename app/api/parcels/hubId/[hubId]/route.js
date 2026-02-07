import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Parcel from "@/models/Parcel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


export async function GET(req, { params }) {
  await connectDB();
try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access only" },
        { status: 403 }
      );
    }

  const { hubId } = params;


  const parcels = await Parcel.find({
    currentHub: hubId,
    status: "AT_HUB",
    consignmentId: null,
  });

  return NextResponse.json(parcels);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
