import connectDB from "@/lib/db";
import Parcel from "@/models/Parcel";

export async function POST(req) {
  try{
  await connectDB();

  const data = await req.json();

  // Generate unique tracking ID
  const trackingId = "TRK" + Math.random().toString().substring(2, 10);

  const parcel = await Parcel.create({ ...data, trackingId });

  return Response.json({
    success: true,
    status : 201,
    trackingId,
    parcel
  });

}catch (error) {
    return Response.json(
      { error: "Booking failed "+ error.message },
      { status: 500 }
    );
  }   
}
