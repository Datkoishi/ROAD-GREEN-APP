import { NextRequest, NextResponse } from "next/server"

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }) // 1 minute
    return true
  }
  
  if (limit.count >= 40) { // 40 requests per minute for isochrone
    return false
  }
  
  limit.count++
  return true
}

function validateCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
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
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const time = searchParams.get('time') || '600' // time in seconds (10 minutes default)
    const vehicle = searchParams.get('vehicle') || 'car'
    const format = searchParams.get('format') || 'json'
    
    if (!lat || !lng) {
      return NextResponse.json({
        success: false,
        error: "Latitude and longitude parameters are required"
      }, { status: 400 })
    }

    const latitude = parseFloat(lat)
    const longitude = parseFloat(lng)
    const timeLimit = parseInt(time)
    
    if (!validateCoordinates(latitude, longitude)) {
      return NextResponse.json({
        success: false,
        error: "Invalid coordinates. Latitude must be between -90 and 90, longitude must be between -180 and 180"
      }, { status: 400 })
    }

    if (timeLimit < 60 || timeLimit > 3600) {
      return NextResponse.json({
        success: false,
        error: "Invalid time limit. Must be between 60 and 3600 seconds."
      }, { status: 400 })
    }

    const apiVersion = process.env.VIETMAP_API_VERSION || '1.1'
    const apiKey = process.env.VIETMAP_API_KEY || '6856756a5a89e36f1acd124738137de6ec22f32a8b94a444'
    
    // VietMap isochrone URL
    const isochroneUrl = `https://maps.vietmap.vn/api/isochrone?api-version=${apiVersion}&apikey=${apiKey}&lat=${latitude}&lon=${longitude}&time_limit=${timeLimit}&vehicle=${vehicle}&format=${format}`
    
    const response = await fetch(isochroneUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RoadGreen-App/1.0'
      }
    })

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `Isochrone calculation failed: ${response.status}`
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
    console.error("Isochrone API error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 })
  }
} 