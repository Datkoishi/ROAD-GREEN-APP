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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    // Get recent customer feedback with driver information
    const feedbackQuery = `
      SELECT 
        dh.id,
        dh.customer_rating,
        dh.customer_feedback,
        dh.delivery_date,
        dh.order_id,
        c.full_name as customer_name,
        u.full_name as driver_name
      FROM delivery_history dh
      LEFT JOIN customers c ON dh.customer_id = c.id
      LEFT JOIN users u ON dh.driver_id = u.id
      WHERE dh.customer_rating IS NOT NULL
      ORDER BY dh.delivery_date DESC
      LIMIT ?
    `

    const feedback = await Database.query(feedbackQuery, [limit])

    // Transform data to match expected format
    const transformedFeedback = feedback.map((item: any) => ({
      id: item.id,
      customer_name: item.customer_name || 'Khách hàng ẩn danh',
      driver_name: item.driver_name || 'Tài xế không xác định',
      rating: item.customer_rating,
      feedback: item.customer_feedback,
      delivery_date: item.delivery_date,
      order_id: item.order_id
    }))

    return NextResponse.json({
      success: true,
      data: transformedFeedback,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Feedback analytics API error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 })
  }
} 