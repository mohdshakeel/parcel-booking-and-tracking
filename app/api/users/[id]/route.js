import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route"; // adjust path
import connectDB from "@/lib/db";
import User from "@/models/User";

// GET /api/users/:id → Get single user
export async function GET(req, { params }) {

  
  
  try {
    await connectDB();

    const { id } = params;
    const user = await User.findById(id).select("-password");

    if (!user) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, user });
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

  const requestedUserId = params.id;        // /api/users/:id
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

    const { id } = params;
    const data = await req.json();

    const user = await User.findByIdAndUpdate(id, data, {
      new: true,
    }).select("-password");

    if (!user) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "User updated successfully",
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
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message+"Error deleting user" },
      { status: 500 }
    );
  }
}
