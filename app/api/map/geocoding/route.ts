import { NextRequest, NextResponse } from "next/server"

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }) // 1 minute
    return true
  }
  
  if (limit.count >= 100) { // 100 requests per minute
    return false
  }
  
  limit.count++
  return true
}

function validateAddress(address: string): boolean {
  return address.trim().length >= 3 && address.trim().length <= 200
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
    const address = searchParams.get('address')
    const limit = parseInt(searchParams.get('limit') || '10')
    const format = searchParams.get('format') || 'json'
    
    if (!address) {
      return NextResponse.json({
        success: false,
        error: "Address parameter is required"
      }, { status: 400 })
    }

    if (!validateAddress(address)) {
      return NextResponse.json({
        success: false,
        error: "Invalid address format. Address must be between 3 and 200 characters."
      }, { status: 400 })
    }

    const apiVersion = process.env.VIETMAP_API_VERSION || '1.1'
    const apiKey = process.env.VIETMAP_API_KEY || '6856756a5a89e36f1acd124738137de6ec22f32a8b94a444'
    
    // VietMap geocoding URL
    const geocodeUrl = `https://maps.vietmap.vn/api/geocode?api-version=${apiVersion}&apikey=${apiKey}&q=${encodeURIComponent(address)}&limit=${limit}&format=${format}`
    
    const response = await fetch(geocodeUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RoadGreen-App/1.0'
      }
    })

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `Geocoding failed: ${response.status}`
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
    console.error("Geocoding API error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 })
  }
} 