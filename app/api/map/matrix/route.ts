import { NextRequest, NextResponse } from "next/server"

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }) // 1 minute
    return true
  }
  
  if (limit.count >= 50) { // 50 requests per minute for matrix
    return false
  }
  
  limit.count++
  return true
}

function validatePoints(points: string[]): boolean {
  return points.length >= 2 && points.length <= 25 // VietMap limit
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
    const points = searchParams.get('points') // comma-separated coordinates
    const vehicle = searchParams.get('vehicle') || 'car'
    const format = searchParams.get('format') || 'json'
    
    if (!points) {
      return NextResponse.json({
        success: false,
        error: "Points parameter is required (comma-separated coordinates)"
      }, { status: 400 })
    }

    const pointArray = points.split(',').map(p => p.trim())
    
    if (!validatePoints(pointArray)) {
      return NextResponse.json({
        success: false,
        error: "Invalid points. Must have 2-25 points."
      }, { status: 400 })
    }

    const apiVersion = process.env.VIETMAP_API_VERSION || '1.1'
    const apiKey = process.env.VIETMAP_API_KEY || '6856756a5a89e36f1acd124738137de6ec22f32a8b94a444'
    
    // VietMap matrix URL
    const matrixUrl = `https://maps.vietmap.vn/api/matrix?api-version=${apiVersion}&apikey=${apiKey}&point=${pointArray.join('&point=')}&vehicle=${vehicle}&format=${format}`
    
    const response = await fetch(matrixUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RoadGreen-App/1.0'
      }
    })

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `Matrix calculation failed: ${response.status}`
      }, { status: response.status })
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      data: data,
      source: 'VietMap API',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Matrix API error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 })
  }
} 