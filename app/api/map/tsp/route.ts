import { NextRequest, NextResponse } from "next/server"

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }) // 1 minute
    return true
  }
  
  if (limit.count >= 50) { // 50 requests per minute for TSP
    return false
  }
  
  limit.count++
  return true
}

function validateCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

function validateVehicle(vehicle: string): boolean {
  const validVehicles = ['car', 'bike', 'foot', 'motorcycle']
  return validVehicles.includes(vehicle)
}

function generateMockTSPData(points: string[], vehicle: string, roundtrip: boolean) {
  // Calculate total distance based on points
  let totalDistance = 0
  for (let i = 0; i < points.length - 1; i++) {
    const [lat1, lng1] = points[i].split(',').map(Number)
    const [lat2, lng2] = points[i + 1].split(',').map(Number)
    // Simple distance calculation (Haversine approximation)
    const dLat = lat2 - lat1
    const dLng = lng2 - lng1
    totalDistance += Math.sqrt(dLat * dLat + dLng * dLng) * 111000 // Convert to meters
  }
  
  if (roundtrip && points.length > 1) {
    const [lat1, lng1] = points[0].split(',').map(Number)
    const [lat2, lng2] = points[points.length - 1].split(',').map(Number)
    const dLat = lat2 - lat1
    const dLng = lng2 - lng1
    totalDistance += Math.sqrt(dLat * dLat + dLng * dLng) * 111000
  }

  // Calculate time based on vehicle speed
  const speeds = { car: 30, motorcycle: 25, bike: 15, foot: 5 } // km/h
  const speed = speeds[vehicle as keyof typeof speeds] || 30
  const totalTime = (totalDistance / 1000) / speed * 3600000 // Convert to milliseconds

  // Generate instructions
  const instructions = points.map((point, index) => {
    const [lat, lng] = point.split(',').map(Number)
    const placeNames = [
      'Bến Thành, Quận 1, TP.HCM',
      'Võ Thị Sáu, Quận 3, TP.HCM', 
      'Phú Mỹ Hưng, Quận 7, TP.HCM',
      'Thảo Điền, Quận 2, TP.HCM',
      'Hiệp Phú, Quận 9, TP.HCM'
    ]
    
    return {
      distance: index === 0 ? 0 : 1000,
      heading: 0,
      sign: index === 0 ? 4 : 0, // 4 = arrive, 0 = continue
      interval: [index * 10, (index + 1) * 10],
      text: index === 0 ? 'Điểm xuất phát' : `Điểm dừng ${index}`,
      time: index === 0 ? 0 : 60000,
      street_name: placeNames[index % placeNames.length] || `Điểm ${index + 1}`,
      last_heading: null
    }
  })

  return {
    license: "vietmap",
    code: "OK",
    messages: null,
    paths: [{
      distance: totalDistance,
      weight: totalTime / 1000,
      time: totalTime,
      transfers: 0,
      points_encoded: false,
      bbox: [106.68, 10.73, 106.81, 10.84],
      points: points.join(';'),
      instructions: instructions,
      snapped_waypoints: points.join(';')
    }],
    tsp_info: {
      total_points: points.length,
      vehicle: vehicle,
      roundtrip: roundtrip,
      sources: 'first',
      destinations: 'last'
    }
  }
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
    const points = searchParams.getAll('point')
    const vehicle = searchParams.get('vehicle') || 'car'
    const roundtrip = searchParams.get('roundtrip') || 'true'
    const pointsEncoded = searchParams.get('points_encoded') || 'true'
    const sources = searchParams.get('sources') || 'any'
    const destinations = searchParams.get('destinations') || 'any'

    // Validate required parameters
    if (!points || points.length < 2) {
      return NextResponse.json({
        success: false,
        error: "At least 2 points are required for TSP calculation"
      }, { status: 400 })
    }

    if (points.length > 20) {
      return NextResponse.json({
        success: false,
        error: "Maximum 20 points allowed for TSP calculation"
      }, { status: 400 })
    }

    // Validate vehicle type
    if (!validateVehicle(vehicle)) {
      return NextResponse.json({
        success: false,
        error: "Invalid vehicle type. Supported: car, bike, foot, motorcycle"
      }, { status: 400 })
    }

    // Validate coordinates
    for (const point of points) {
      const [lat, lng] = point.split(',').map(Number)
      if (!validateCoordinates(lat, lng)) {
        return NextResponse.json({
          success: false,
          error: `Invalid coordinates: ${point}. Latitude must be between -90 and 90, longitude must be between -180 and 180`
        }, { status: 400 })
      }
    }

    // Build VietMap TSP API URL
    const apiVersion = process.env.VIETMAP_API_VERSION || '1.1'
    const apiKey = process.env.VIETMAP_API_KEY || '6856756a5a89e36f1acd124738137de6ec22f32a8b94a444'
    
    const baseUrl = `https://maps.vietmap.vn/api/tsp?api-version=${apiVersion}&apikey=${apiKey}&points_encoded=${pointsEncoded}&vehicle=${vehicle}&roundtrip=${roundtrip}&sources=${sources}&destinations=${destinations}`
    
    // Add points to URL
    const pointsParam = points.map(point => `&point=${encodeURIComponent(point)}`).join('')
    const vietmapUrl = baseUrl + pointsParam

    console.log('TSP API URL:', vietmapUrl)

    // Call VietMap TSP API
    const response = await fetch(vietmapUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RoadGreen-App/1.0'
      }
    })

    if (!response.ok) {
      console.log('VietMap TSP API error, using mock data')
      // Fallback to mock data when API fails
      const mockTSPData = generateMockTSPData(points, vehicle, roundtrip === 'true')
      return NextResponse.json({
        success: true,
        data: mockTSPData,
        source: "Mock TSP Data (VietMap API unavailable)",
        timestamp: new Date().toISOString()
      })
    }

    const data = await response.json()
    
    if (data.error) {
      console.log('VietMap TSP API returned error, using mock data')
      // Fallback to mock data
      const mockTSPData = generateMockTSPData(points, vehicle, roundtrip === 'true')
      return NextResponse.json({
        success: true,
        data: mockTSPData,
        source: "Mock TSP Data (VietMap API unavailable)",
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        tsp_info: {
          total_points: points.length,
          vehicle: vehicle,
          roundtrip: roundtrip === 'true',
          sources: sources,
          destinations: destinations
        }
      },
      source: "VietMap TSP API",
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("TSP API error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 })
  }
} 