import { connectMongo } from "@/utilities/connection";
import User from "@/app/models/User";
import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/utilities/gerUserId";
import { LeanUser } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    const token = req.cookies.get("token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const currentUserId = await getUserId(token);

    await connectMongo();

    let users: LeanUser[];

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      // If no query, return first 20 users alphabetically
      users = await User.find({
        _id: { $ne: currentUserId }
      })
      .select('name email createdAt')
      .sort({ name: 1 }) // Sort alphabetically by name
      .limit(20)
      .lean<LeanUser[]>();
    } else {
      // Create regex pattern for case-insensitive search
      const searchRegex = new RegExp(query.trim(), 'i');
      
      // Search users by name, exclude current user, limit to 20 results
      users = await User.find({
        _id: { $ne: currentUserId },
        $or: [{ name: { $regex: searchRegex } }]
      })
      .select('_id name createdAt')
      .limit(20)
      .lean<LeanUser[]>();
    }

    // Convert ObjectIds to strings for client compatibility
    const sanitizedUsers = users.map(user => ({
      ...user,
      _id: user._id.toString(),
      createdAt: user.createdAt.toISOString()
    }));

    return NextResponse.json({ users: sanitizedUsers }, { status: 200 });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
