import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Consignment from "@/models/Consignment";
import Parcel from "@/models/Parcel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {

try{


await connectDB();
const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access only" },
        { status: 403 }
      );
    }
  const { sourceHub, destinationHub, parcelIds } = await req.json();

  if (!parcelIds?.length) {
    return Response.json({ error: "No parcels selected" }, { status: 400 });
  }

  const consignment = await Consignment.create({
    consignmentNumber: `CN-${Date.now()}`,
    sourceHub,
    destinationHub,
    parcels: parcelIds,
    status: "CREATED",
  });

  await Parcel.updateMany(
    { _id: { $in: parcelIds } },
    {
      $set: {
        consignmentId: consignment._id,
        status: "IN_TRANSIT",
      },
    }
  );

  return NextResponse.json({ success: true, consignment });
  } catch (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
}
