import connectDB from "@/lib/db";
import Parcel from "@/models/Parcel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ulid } from "ulid";

export async function POST(req) {
  try{
  await connectDB();
  const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json(
        { error: "Unauthorized",success:false },
        { status: 401 }
      );
    }


  const data = await req.json();
  const userId = session.user.id; // ✅ session user id

  // Generate unique tracking ID
  //const trackingId = "TRK" + Math.random().toString().substring(2, 10);
  const trackingId = `TRK-${ulid().toUpperCase()}`;

  const parcel = await Parcel.create({ ...data, trackingId,userId});

  return Response.json({
    success: true,
    status : 201,
    trackingId,
    parcel
  });

}catch (error) {
    return Response.json(
      { success:false,error: "Booking failed "+ error.message },
      { status: 500 }
    );
  }   
}
