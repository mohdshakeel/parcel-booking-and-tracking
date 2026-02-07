import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route"; // adjust path
import connectDB from "@/lib/db";
import User from "@/models/Hub";

// GET /api/users/:id → Get single user
export async function GET(req, { params }) {

  
  
  try {
    await connectDB();

    const { id } = params;
    const hub = await Hub.findById(id).select("-password");

    if (!hub) {
      return Response.json(
        { success: false, error: "Hub not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, hub });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message+"Invalid user ID" },
      { status: 400 }
    );
  }
}

  

// PUT /api/users/:id → Update user
export async function PUT(req, { params }) {

  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  const data = await req.json();
  const id = data.id;

  const requestedUserId = id;        // /api/hubs/:id
  const sessionUserId = session.user.id;    // logged-in user id
  const role = session.user.role;           // "user" | "admin"

  // -------------------------------------------
  // 🔐 AUTHORIZATION CHECK
  // -------------------------------------------

  if (role === "user" && sessionUserId !== requestedUserId) {
    return Response.json(
      { error: "You are not allowed to update another user's profile.-"+role+"-"+sessionUserId+"-"+requestedUserId },
      { status: 403 }
    );
  }



  try {
    await connectDB();

    //const { id } = params;
   const hub = await Hub.findByIdAndUpdate(id, data, {
  new: true,
});


    if (!hub) {
      return Response.json(
        { success: false, error: "Hub not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Hub updated successfully",
      user,
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message+"Error updating user" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/:id → Delete user
export async function DELETE(req, { params }) {
  

  try {
    await connectDB();

    const { id } = params;
    const hub = await Hub.findByIdAndDelete(id);

    if (!hub) {
      return Response.json(
        { success: false, error: "Hub not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Hub deleted successfully",
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message+"Error deleting user" },
      { status: 500 }
    );
  }
}