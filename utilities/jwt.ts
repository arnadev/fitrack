import { SignJWT, jwtVerify } from "jose";
import type { JWTPayload } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const EXPIRES_IN = "7d"; // token validity

export interface myJWTPayload extends JWTPayload {
  id: string;
  email: string;
}

// Generate token for a user
export async function generateToken(payload: myJWTPayload): Promise<string> {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(JWT_SECRET);
  
  return jwt;
}

// Verify token (returns decoded payload if valid) else null
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch (err) {
    return null;
  }
}
