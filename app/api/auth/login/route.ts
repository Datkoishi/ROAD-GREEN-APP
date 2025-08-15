import { NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }) // 1 minute
    return true
  }
  
  if (limit.count >= 10) { // 10 login attempts per minute
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
        error: "Quá nhiều lần đăng nhập. Vui lòng thử lại sau 1 phút."
      }, { status: 429 })
    }

    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: "Email và mật khẩu là bắt buộc"
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: "Mật khẩu phải có ít nhất 6 ký tự"
      }, { status: 400 })
    }

    // Check if user exists
    const userQuery = `
      SELECT 
        id, username, email, password_hash, full_name, phone, 
        vehicle_type, points, total_deliveries, rating, status,
        last_location_lat, last_location_lng, last_location_update,
        created_at
      FROM users 
      WHERE email = ? AND status = 'active'
    `
    
    const users = await Database.query(userQuery, [email])
    
    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Email hoặc mật khẩu không đúng"
      }, { status: 401 })
    }

    const user = users[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        error: "Email hoặc mật khẩu không đúng"
      }, { status: 401 })
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'road-green-secret-key'
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role || 'driver',
        username: user.username 
      },
      jwtSecret,
      { expiresIn: '7d' }
    )

    // Get today's delivery count
    const today = new Date().toISOString().split('T')[0]
    const todayDeliveriesQuery = `
      SELECT COUNT(*) as count 
      FROM delivery_history 
      WHERE driver_id = ? AND DATE(delivery_date) = ?
    `
    const todayDeliveries = await Database.query(todayDeliveriesQuery, [user.id, today])

    // Get recent customer feedback
    const feedbackQuery = `
      SELECT 
        dh.customer_rating, dh.customer_feedback, dh.delivery_date,
        c.full_name as customer_name
      FROM delivery_history dh
      LEFT JOIN customers c ON dh.customer_id = c.id
      WHERE dh.driver_id = ? AND dh.customer_rating IS NOT NULL
      ORDER BY dh.delivery_date DESC
      LIMIT 5
    `
    const recentFeedback = await Database.query(feedbackQuery, [user.id])

    // Calculate total distance
    const distanceQuery = `
      SELECT COALESCE(SUM(distance_km), 0) as total_distance
      FROM delivery_history 
      WHERE driver_id = ?
    `
    const distanceResult = await Database.query(distanceQuery, [user.id])

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
          points: user.points,
          total_deliveries: user.total_deliveries,
          rating: user.rating,
          status: user.status,
          last_location_lat: user.last_location_lat,
          last_location_lng: user.last_location_lng,
          last_location_update: user.last_location_update,
          created_at: user.created_at
        },
        token,
        stats: {
          today_deliveries: todayDeliveries[0]?.count || 0,
          total_deliveries: user.total_deliveries,
          total_distance: distanceResult[0]?.total_distance || 0,
          rating: user.rating,
          points: user.points
        },
        recent_feedback: recentFeedback
      },
      message: "Đăng nhập thành công"
    })

  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Lỗi đăng nhập"
    }, { status: 500 })
  }
}
