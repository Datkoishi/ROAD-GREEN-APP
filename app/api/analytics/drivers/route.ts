import { NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"

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

    // Get today's date
    const today = new Date().toISOString().split('T')[0]

    // Get all drivers with their statistics
    const driversQuery = `
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
        WHERE DATE(delivery_date) = ?
        GROUP BY driver_id
      ) today_deliveries ON u.id = today_deliveries.driver_id
      LEFT JOIN (
        SELECT 
          driver_id,
          SUM(distance_km * 1000) as sum_distance
        FROM delivery_history 
        GROUP BY driver_id
      ) total_distance ON u.id = total_distance.driver_id
      WHERE u.status IN ('active', 'inactive')
      ORDER BY u.total_deliveries DESC, u.points DESC
    `

    const drivers = await Database.query(driversQuery, [today])

    // Transform data to match expected format
    const transformedDrivers = drivers.map((driver: any) => ({
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
    }))

    return NextResponse.json({
      success: true,
      data: transformedDrivers,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Drivers analytics API error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 })
  }
} 