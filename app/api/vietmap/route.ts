import { NextRequest, NextResponse } from "next/server"

// Simple in-memory rate limiting (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = 100 // requests per window
  const window = 60 * 1000 // 1 minute window
  
  const record = rateLimitMap.get(ip)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + window })
    return true
  }
  
  if (record.count >= limit) {
    return false
  }
  
  record.count++
  return true
}

function validateCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

function validateVehicle(vehicle: string): boolean {
  const validVehicles = ['car', 'motorbike', 'bike', 'truck']
  return validVehicles.includes(vehicle)
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        timestamp: new Date().toISOString()
      }, { status: 429 })
    }
    
    const { searchParams } = new URL(request.url)
    
    // Lấy các tham số từ query string
    const apiVersion = searchParams.get('api-version') || process.env.VIETMAP_API_VERSION || '1.1'
    const apiKey = process.env.VIETMAP_API_KEY || '6856756a5a89e36f1acd124738137de6ec22f32a8b94a444'
    const point1 = searchParams.get('point1') || '10.7729,106.6984'
    const point2 = searchParams.get('point2') || '10.7884,106.7056'
    const vehicle = searchParams.get('vehicle') || 'car'
    
    // Input validation
    if (!validateVehicle(vehicle)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid vehicle type. Supported: car, motorbike, bike, truck',
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }
    
    // Validate coordinates
    const [lat1, lng1] = point1.split(',').map(Number)
    const [lat2, lng2] = point2.split(',').map(Number)
    
    if (!validateCoordinates(lat1, lng1) || !validateCoordinates(lat2, lng2)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid coordinates provided',
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }
    
    // Tạo URL cho VietMap API
    const vietmapUrl = `https://maps.vietmap.vn/api/route?api-version=${apiVersion}&apikey=${apiKey}&point=${point1}&point=${point2}&vehicle=${vehicle}`
    
    // Gọi VietMap API
    const response = await fetch(vietmapUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RoadGreen-App/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`VietMap API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      data: data,
      source: 'VietMap API',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('VietMap API proxy error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 