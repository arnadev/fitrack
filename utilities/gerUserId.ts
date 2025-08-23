import { jwtVerify } from "jose";

export const getUserId = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    if(!payload.id){
      throw new Error("Invalid token");
    }
    return payload.id as string;
  } catch (error) {
    throw new Error("Unauthenticated access");
  }
};
