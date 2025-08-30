import { connectMongo } from "@/utilities/connection";
import User from "@/app/models/User";
import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/utilities/jwt";
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    await connectMongo();

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Generate JWT token
    const token = await generateToken({ id: user._id.toString(), email: user.email });

    // Create response with cookie
    const response = NextResponse.json({ message: 'Login successful' }, { status: 200 });
    
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
