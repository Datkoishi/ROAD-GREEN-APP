import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function verifyToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { success: false, error: "No token provided" }
    }

    const token = authHeader.substring(7) // Remove "Bearer " prefix

    const decoded = jwt.verify(token, JWT_SECRET) as any

    return {
      success: true,
      userId: decoded.userId,
      email: decoded.email,
    }
  } catch (error) {
    return { success: false, error: "Invalid token" }
  }
}

export function generateToken(userId: number, email: string) {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "7d" })
}
