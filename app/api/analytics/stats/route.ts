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

    // Get comprehensive statistics
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE status IN ('active', 'inactive')) as total_drivers,
        (SELECT COUNT(*) FROM users WHERE status = 'active') as active_drivers,
        (SELECT COUNT(*) FROM delivery_history WHERE DATE(delivery_date) = ?) as today_deliveries,
        (SELECT COUNT(*) FROM delivery_history) as total_deliveries,
        (SELECT COALESCE(SUM(distance_km * 1000), 0) FROM delivery_history) as total_distance,
        (SELECT COALESCE(AVG(customer_rating), 5.0) FROM delivery_history WHERE customer_rating IS NOT NULL) as average_rating,
        (SELECT COALESCE(SUM(points), 0) FROM users) as total_points
    `

    const stats = await Database.query(statsQuery, [today])

    const result = stats[0]

    return NextResponse.json({
      success: true,
      data: {
        total_drivers: result.total_drivers,
        active_drivers: result.active_drivers,
        today_deliveries: result.today_deliveries,
        total_deliveries: result.total_deliveries,
        total_distance: result.total_distance,
        average_rating: parseFloat(result.average_rating),
        total_points: result.total_points
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Stats analytics API error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 })
  }
} 