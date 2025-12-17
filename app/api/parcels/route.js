import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Parcel from "@/models/Parcel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const session = await getServerSession(authOptions);

if (!session?.user?.id) {
  return new Response("Unauthorized", { status: 401 });
}

const userId = session.user.id;


  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "All";
  const sort = searchParams.get("sort") || "createdAt";

  const query = {
    userId, // 👈 filter by logged-in user
    ...(status !== "All" && { status }),
    ...(search && {
      $or: [
        { orderId: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { route: { $regex: search, $options: "i" } },
      ],
    }),
  };

  const total = await Parcel.countDocuments(query);

  const parcels = await Parcel.find(query)
    .sort({ [sort]: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return NextResponse.json({
    data: parcels,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
