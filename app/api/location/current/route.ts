import { NextRequest, NextResponse } from "next/server"

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }) // 1 minute
    return true
  }
  
  if (limit.count >= 50) { // 50 requests per minute
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
    const latitude = searchParams.get('lat')
    const longitude = searchParams.get('lng')
    
    if (!latitude || !longitude) {
      return NextResponse.json({
        success: false,
        error: "Latitude and longitude parameters are required"
      }, { status: 400 })
    }

    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({
        success: false,
        error: "Invalid latitude or longitude values"
      }, { status: 400 })
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({
        success: false,
        error: "Latitude must be between -90 and 90, longitude must be between -180 and 180"
      }, { status: 400 })
    }

    // Get location info using reverse geocoding
    const apiVersion = process.env.VIETMAP_API_VERSION || '1.1'
    const apiKey = process.env.VIETMAP_API_KEY || '6856756a5a89e36f1acd124738137de6ec22f32a8b94a444'
    
    const reverseGeocodeUrl = `https://maps.vietmap.vn/api/reverse?api-version=${apiVersion}&apikey=${apiKey}&lat=${lat}&lon=${lng}&format=json`
    
    const response = await fetch(reverseGeocodeUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RoadGreen-App/1.0'
      }
    })

    if (!response.ok) {
      // Fallback to mock data if API fails
      const mockLocationData = {
        display_name: `Vị trí tại ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        address: {
          road: "Đường chưa xác định",
          suburb: "Phường chưa xác định",
          district: "Quận chưa xác định",
          city: "TP.HCM",
          country: "Việt Nam"
        },
        lat: lat.toString(),
        lon: lng.toString()
      }

      return NextResponse.json({
        success: true,
        data: {
          location: mockLocationData,
          coordinates: {
            latitude: lat,
            longitude: lng
          },
          timestamp: new Date().toISOString(),
          source: "mock_data"
        }
      })
    }

    const data = await response.json()
    
    if (data.error) {
      return NextResponse.json({
        success: false,
        error: data.error
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: {
        location: data,
        coordinates: {
          latitude: lat,
          longitude: lng
        },
        timestamp: new Date().toISOString(),
        source: "vietmap_api"
      }
    })

  } catch (error) {
    console.error("Location API error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 })
  }
} 