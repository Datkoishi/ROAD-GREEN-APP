import { NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import bcrypt from "bcryptjs"

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }) // 1 minute
    return true
  }
  
  if (limit.count >= 5) { // 5 registration attempts per minute
    return false
  }
  
  limit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json({
        success: false,
        error: "Quá nhiều lần đăng ký. Vui lòng thử lại sau 1 phút."
      }, { status: 429 })
    }

    const { 
      username, 
      email, 
      password, 
      full_name, 
      phone, 
      vehicle_type = 'motorbike',
      vehicle_plate = '',
      driver_license = ''
    } = await request.json()

    // Validate required fields
    if (!username || !email || !password || !full_name || !phone) {
      return NextResponse.json({
        success: false,
        error: "Tất cả các trường bắt buộc phải được điền"
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: "Email không hợp lệ"
      }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: "Mật khẩu phải có ít nhất 6 ký tự"
      }, { status: 400 })
    }

    // Validate phone format (Vietnamese)
    const phoneRegex = /^[0-9]{10,11}$/
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json({
        success: false,
        error: "Số điện thoại không hợp lệ"
      }, { status: 400 })
    }

    // Validate vehicle type
    const validVehicleTypes = ['motorbike', 'car', 'truck']
    if (!validVehicleTypes.includes(vehicle_type)) {
      return NextResponse.json({
        success: false,
        error: "Loại phương tiện không hợp lệ"
      }, { status: 400 })
    }

    // Check if username already exists
    const existingUsernameQuery = "SELECT id FROM users WHERE username = ?"
    const existingUsername = await Database.query(existingUsernameQuery, [username])
    
    if (existingUsername.length > 0) {
      return NextResponse.json({
        success: false,
        error: "Tên đăng nhập đã tồn tại"
      }, { status: 409 })
    }

    // Check if email already exists
    const existingEmailQuery = "SELECT id FROM users WHERE email = ?"
    const existingEmail = await Database.query(existingEmailQuery, [email])
    
    if (existingEmail.length > 0) {
      return NextResponse.json({
        success: false,
        error: "Email đã được sử dụng"
      }, { status: 409 })
    }

    // Check if phone already exists
    const existingPhoneQuery = "SELECT id FROM users WHERE phone = ?"
    const existingPhone = await Database.query(existingPhoneQuery, [phone])
    
    if (existingPhone.length > 0) {
      return NextResponse.json({
        success: false,
        error: "Số điện thoại đã được sử dụng"
      }, { status: 409 })
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Insert new user
    const insertQuery = `
      INSERT INTO users (
        username, email, password_hash, full_name, phone,
        vehicle_type, vehicle_plate, driver_license,
        points, total_deliveries, rating, status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 5.00, 'active', NOW(), NOW())
    `
    
    const result = await Database.query(insertQuery, [
      username, email, passwordHash, full_name, phone,
      vehicle_type, vehicle_plate, driver_license
    ])

    const userId = result.insertId

    // Get the created user (without password)
    const userQuery = `
      SELECT 
        id, username, email, full_name, phone,
        vehicle_type, vehicle_plate, driver_license,
        points, total_deliveries, rating, status,
        created_at
      FROM users 
      WHERE id = ?
    `
    
    const users = await Database.query(userQuery, [userId])
    const user = users[0]

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          vehicle_type: user.vehicle_type,
          vehicle_plate: user.vehicle_plate,
          driver_license: user.driver_license,
          points: user.points,
          total_deliveries: user.total_deliveries,
          rating: user.rating,
          status: user.status,
          created_at: user.created_at
        }
      },
      message: "Đăng ký thành công! Vui lòng đăng nhập."
    })

  } catch (error) {
    console.error("Register API error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Lỗi đăng ký"
    }, { status: 500 })
  }
}
