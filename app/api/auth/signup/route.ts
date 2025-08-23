import { connectMongo } from "@/utilities/connection";
import User from "@/app/models/User";
import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/utilities/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    await connectMongo();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Create a new user
    const newUser = new User({ name, email, password });
    await newUser.save();

    // Generate JWT token
    const token = await generateToken({ id: newUser._id.toString(), email: newUser.email });

    // Create response with cookie
    const response = NextResponse.json({ message: 'User created successfully' }, { status: 201 });
    
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Error during signup:", error);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
