import { SignJWT, jwtVerify } from "jose";
import { JWTPayload } from "@/types";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const EXPIRES_IN = "7d"; // token validity

// Generate token for a user
export async function generateToken(payload: Record<string, any>): Promise<string> {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(JWT_SECRET);
  
  return jwt;
}

// Verify token (returns decoded payload if valid)
export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (err) {
    return null;
  }
}
