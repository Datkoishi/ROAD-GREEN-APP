import { NextRequest, NextResponse } from "next/server"

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }) // 1 minute
    return true
  }
  
  if (limit.count >= 100) { // 100 requests per minute for routing
    return false
  }
  
  limit.count++
  return true
}

function validateCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

function validateVehicle(vehicle: string): boolean {
  const validVehicles = ['car', 'motorcycle', 'bike', 'truck']
  return validVehicles.includes(vehicle)
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
    const point1 = searchParams.get('point1')
    const point2 = searchParams.get('point2')
    const vehicle = searchParams.get('vehicle') || 'car'
    const format = searchParams.get('format') || 'json'
    
    if (!point1 || !point2) {
      return NextResponse.json({
        success: false,
        error: "Both point1 and point2 parameters are required"
      }, { status: 400 })
    }

    // Validate coordinates
    const [lat1, lng1] = point1.split(',').map(Number)
    const [lat2, lng2] = point2.split(',').map(Number)
    
    if (!validateCoordinates(lat1, lng1) || !validateCoordinates(lat2, lng2)) {
      return NextResponse.json({
        success: false,
        error: "Invalid coordinates provided"
      }, { status: 400 })
    }

    if (!validateVehicle(vehicle)) {
      return NextResponse.json({
        success: false,
        error: "Invalid vehicle type. Supported: car, motorcycle, bike, truck"
      }, { status: 400 })
    }

    const apiVersion = process.env.VIETMAP_API_VERSION || '1.1'
    const apiKey = process.env.VIETMAP_API_KEY || '6856756a5a89e36f1acd124738137de6ec22f32a8b94a444'
    
    // VietMap routing URL
    const routingUrl = `https://maps.vietmap.vn/api/route?api-version=${apiVersion}&apikey=${apiKey}&point=${point1}&point=${point2}&vehicle=${vehicle}&format=${format}`
    
    const response = await fetch(routingUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RoadGreen-App/1.0'
      }
    })

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `Routing failed: ${response.status}`
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
    console.error("Routing API error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 })
  }
} 