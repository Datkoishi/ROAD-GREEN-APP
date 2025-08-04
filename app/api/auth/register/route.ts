import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { UserModel } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, full_name, phone, vehicle_type, driver_license, vehicle_plate } =
      await request.json()

    // Validation
    if (!username || !email || !password || !full_name || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const existingPhone = await UserModel.findByPhone(phone)
    if (existingPhone) {
      return NextResponse.json({ error: "Phone number already registered" }, { status: 409 })
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10)

    // Create user
    const userId = await UserModel.create({
      username,
      email,
      password_hash,
      full_name,
      phone,
      vehicle_type,
      driver_license,
      vehicle_plate,
    })

    // Generate JWT token
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "7d" })

    // Get user data (without password)
    const user = await UserModel.findById(userId)
    delete user.password_hash

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user,
        token,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
