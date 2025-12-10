import connectDB from "@/lib/db";
import Tracking from "@/models/Tracking";
import Parcel from "@/models/Parcel";

export async function POST(req) {
  try{
  await connectDB();
  const { trackingId } = await req.json();

  const parcel = await Parcel.findOne({ trackingId });
  const updates = await Tracking.find({ trackingId }).sort({ updatedAt: -1 });

  return Response.json({
    found: !!parcel,
    parcel,
    updates
  });
}catch (error) {  
    return Response.json(
      { error: error.message+"Tracking failed" },
      { status: 500 }
    );
  }
}
