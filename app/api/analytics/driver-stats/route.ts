import { NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import jwt from "jsonwebtoken"

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }) // 1 minute
    return true
  }
  
  if (limit.count >= 30) { // 30 requests per minute
    return false
  }
  
  limit.count++
  return true
}

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json({
        success: false,
        error: "Rate limit exceeded. Please try again later."
      }, { status: 429 })
    }

    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized - Token required"
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const jwtSecret = process.env.JWT_SECRET || 'road-green-secret-key'

    // Verify JWT token
    let decoded: any
    try {
      decoded = jwt.verify(token, jwtSecret)
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: "Invalid token"
      }, { status: 401 })
    }

    const userId = decoded.userId

    // Get today's date
    const today = new Date().toISOString().split('T')[0]

    // Get driver statistics
    const driverQuery = `
      SELECT 
        u.id,
        u.full_name,
        u.phone,
        u.vehicle_type,
        u.points,
        u.total_deliveries,
        u.rating,
        u.status,
        u.last_location_lat,
        u.last_location_lng,
        u.last_location_update,
        u.created_at,
        COALESCE(today_deliveries.count, 0) as today_deliveries,
        COALESCE(total_distance.sum_distance, 0) as total_distance
      FROM users u
      LEFT JOIN (
        SELECT 
          driver_id,
          COUNT(*) as count
        FROM delivery_history 
        WHERE driver_id = ? AND DATE(delivery_date) = ?
        GROUP BY driver_id
      ) today_deliveries ON u.id = today_deliveries.driver_id
      LEFT JOIN (
        SELECT 
          driver_id,
          SUM(distance_km * 1000) as sum_distance
        FROM delivery_history 
        WHERE driver_id = ?
        GROUP BY driver_id
      ) total_distance ON u.id = total_distance.driver_id
      WHERE u.id = ?
    `

    const drivers = await Database.query(driverQuery, [userId, today, userId, userId])

    if (drivers.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Driver not found"
      }, { status: 404 })
    }

    const driver = drivers[0]

    // Get recent feedback for this driver
    const feedbackQuery = `
      SELECT 
        dh.id,
        dh.customer_rating,
        dh.customer_feedback,
        dh.delivery_date,
        dh.order_id,
        c.full_name as customer_name
      FROM delivery_history dh
      LEFT JOIN customers c ON dh.customer_id = c.id
      WHERE dh.driver_id = ? AND dh.customer_rating IS NOT NULL
      ORDER BY dh.delivery_date DESC
      LIMIT 5
    `

    const feedback = await Database.query(feedbackQuery, [userId])

    // Transform data
    const transformedDriver = {
      id: driver.id,
      full_name: driver.full_name,
      phone: driver.phone,
      vehicle_type: driver.vehicle_type,
      today_deliveries: driver.today_deliveries,
      total_deliveries: driver.total_deliveries,
      total_distance: driver.total_distance,
      rating: driver.rating,
      points: driver.points,
      status: driver.status,
      last_location_lat: driver.last_location_lat,
      last_location_lng: driver.last_location_lng,
      last_location_update: driver.last_location_update,
      created_at: driver.created_at
    }

    const transformedFeedback = feedback.map((item: any) => ({
      id: item.id,
      customer_name: item.customer_name || 'Khách hàng ẩn danh',
      rating: item.customer_rating,
      feedback: item.customer_feedback,
      delivery_date: item.delivery_date,
      order_id: item.order_id
    }))

    return NextResponse.json({
      success: true,
      data: {
        driver: transformedDriver,
        recent_feedback: transformedFeedback
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Driver stats API error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 })
  }
} 