import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });
    
    // Clear the token cookie by setting it to expire in the past
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0, // Expire immediately
      path: "/",
      expires: new Date(0), // Set to epoch time
    });

    return response;
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
