import { NextRequest, NextResponse } from "next/server"

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }) // 1 minute
    return true
  }
  
  if (limit.count >= 150) { // 150 requests per minute for autocomplete
    return false
  }
  
  limit.count++
  return true
}

function validateQuery(query: string): boolean {
  return query.trim().length >= 2 && query.trim().length <= 100
}

function generateMockAutocompleteData(query: string, limit: number) {
  const mockData = [
    {
      place_id: "1",
      display_name: "Bến Thành Market, Quận 1, TP.HCM",
      lat: "10.7729",
      lon: "106.6984",
      type: "market",
      importance: 0.9,
      address: {
        road: "Lê Lợi",
        district: "Quận 1",
        city: "TP.HCM"
      }
    },
    {
      place_id: "2",
      display_name: "Phú Mỹ Hưng, Quận 7, TP.HCM",
      lat: "10.7379",
      lon: "106.7017",
      type: "residential",
      importance: 0.8,
      address: {
        road: "Nguyễn Thị Thập",
        district: "Quận 7",
        city: "TP.HCM"
      }
    },
    {
      place_id: "3",
      display_name: "Võ Thị Sáu, Quận 3, TP.HCM",
      lat: "10.7884",
      lon: "106.7056",
      type: "street",
      importance: 0.7,
      address: {
        road: "Võ Thị Sáu",
        district: "Quận 3",
        city: "TP.HCM"
      }
    },
    {
      place_id: "4",
      display_name: "Thảo Điền, Quận 2, TP.HCM",
      lat: "10.7872",
      lon: "106.7498",
      type: "residential",
      importance: 0.8,
      address: {
        road: "Thảo Điền",
        district: "Quận 2",
        city: "TP.HCM"
      }
    },
    {
      place_id: "5",
      display_name: "Hiệp Phú, Quận 9, TP.HCM",
      lat: "10.8411",
      lon: "106.8098",
      type: "residential",
      importance: 0.6,
      address: {
        road: "Hiệp Phú",
        district: "Quận 9",
        city: "TP.HCM"
      }
    },
    {
      place_id: "6",
      display_name: `${query} Market, Quận 1, TP.HCM`,
      lat: "10.7729",
      lon: "106.6984",
      type: "market",
      importance: 0.8,
      address: {
        road: `${query} Street`,
        district: "Quận 1",
        city: "TP.HCM"
      }
    },
    {
      place_id: "7",
      display_name: "Landmark 81, Quận Bình Thạnh, TP.HCM",
      lat: "10.7951",
      lon: "106.7215",
      type: "building",
      importance: 0.9,
      address: {
        road: "Vinhomes Central Park",
        district: "Quận Bình Thạnh",
        city: "TP.HCM"
      }
    },
    {
      place_id: "8",
      display_name: "Saigon Centre, Quận 1, TP.HCM",
      lat: "10.7769",
      lon: "106.7009",
      type: "shopping",
      importance: 0.8,
      address: {
        road: "Lê Lợi",
        district: "Quận 1",
        city: "TP.HCM"
      }
    },
    {
      place_id: "9",
      display_name: "Diamond Plaza, Quận 1, TP.HCM",
      lat: "10.7769",
      lon: "106.7009",
      type: "shopping",
      importance: 0.8,
      address: {
        road: "Lê Duẩn",
        district: "Quận 1",
        city: "TP.HCM"
      }
    },
    {
      place_id: "10",
      display_name: "Vincom Centre, Quận 1, TP.HCM",
      lat: "10.7769",
      lon: "106.7009",
      type: "shopping",
      importance: 0.8,
      address: {
        road: "Lê Thánh Tôn",
        district: "Quận 1",
        city: "TP.HCM"
      }
    },
    {
      place_id: "2",
      display_name: `${query} Plaza, Quận 3, TP.HCM`,
      lat: "10.7884",
      lon: "106.7056",
      type: "shopping",
      importance: 0.7,
      address: {
        road: `${query} Plaza`,
        district: "Quận 3",
        city: "TP.HCM"
      }
    },
    {
      place_id: "3",
      display_name: `${query} Restaurant, Quận 7, TP.HCM`,
      lat: "10.7379",
      lon: "106.7017",
      type: "restaurant",
      importance: 0.6,
      address: {
        road: `${query} Restaurant`,
        district: "Quận 7",
        city: "TP.HCM"
      }
    },
    {
      place_id: "4",
      display_name: `${query} Hotel, Quận 2, TP.HCM`,
      lat: "10.7872",
      lon: "106.7498",
      type: "hotel",
      importance: 0.9,
      address: {
        road: `${query} Hotel`,
        district: "Quận 2",
        city: "TP.HCM"
      }
    },
    {
      place_id: "5",
      display_name: `${query} Hospital, Quận 9, TP.HCM`,
      lat: "10.8411",
      lon: "106.8098",
      type: "hospital",
      importance: 0.8,
      address: {
        road: `${query} Hospital`,
        district: "Quận 9",
        city: "TP.HCM"
      }
    }
  ]

  // Filter based on query similarity
  const queryLower = query.toLowerCase()
  const filteredData = mockData.filter(item => 
    item.display_name.toLowerCase().includes(queryLower) ||
    item.address.road?.toLowerCase().includes(queryLower) ||
    item.address.district?.toLowerCase().includes(queryLower) ||
    (queryLower.includes('ben') && item.display_name.toLowerCase().includes('ben')) ||
    (queryLower.includes('phu') && item.display_name.toLowerCase().includes('phu')) ||
    (queryLower.includes('vo') && item.display_name.toLowerCase().includes('vo')) ||
    (queryLower.includes('thao') && item.display_name.toLowerCase().includes('thao')) ||
    (queryLower.includes('hiep') && item.display_name.toLowerCase().includes('hiep')) ||
    (queryLower.includes('landmark') && item.display_name.toLowerCase().includes('landmark')) ||
    (queryLower.includes('saigon') && item.display_name.toLowerCase().includes('saigon')) ||
    (queryLower.includes('diamond') && item.display_name.toLowerCase().includes('diamond')) ||
    (queryLower.includes('vincom') && item.display_name.toLowerCase().includes('vincom'))
  )

  return filteredData.slice(0, limit)
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
    const q = searchParams.get('q') || searchParams.get('query') // Support both 'q' and 'query' parameters
    const limit = parseInt(searchParams.get('limit') || '8')
    const format = searchParams.get('format') || 'json'
    
    if (!q) {
      return NextResponse.json({
        success: false,
        error: "Query parameter 'q' or 'query' is required"
      }, { status: 400 })
    }

    if (!validateQuery(q)) {
      return NextResponse.json({
        success: false,
        error: "Invalid query format. Query must be between 2 and 100 characters."
      }, { status: 400 })
    }

    // Try VietMap API first
    const apiVersion = process.env.VIETMAP_API_VERSION || '1.1'
    const apiKey = process.env.VIETMAP_API_KEY || '6856756a5a89e36f1acd124738137de6ec22f32a8b94a444'
    
    // VietMap autocomplete URL
    const vietmapUrl = `https://maps.vietmap.vn/api/autocomplete?api-version=${apiVersion}&apikey=${apiKey}&q=${encodeURIComponent(q)}&limit=${limit}&format=${format}`
    
    try {
      const vietmapResponse = await fetch(vietmapUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'RoadGreen-App/1.0'
        }
      })

      const vietmapData = await vietmapResponse.json()
      
      // Check if VietMap API returned valid results
      if (vietmapData.data && vietmapData.data.features && vietmapData.data.features.length > 0) {
        console.log('VietMap API returned valid results')
        return NextResponse.json({
          success: true,
          data: vietmapData.data.features,
          source: 'VietMap API',
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      console.log('VietMap API failed, trying OpenStreetMap')
    }

    // Fallback to OpenStreetMap Nominatim API for real data
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ', Ho Chi Minh City, Vietnam')}&format=json&limit=${limit}&addressdetails=1&countrycodes=vn`
      
      const nominatimResponse = await fetch(nominatimUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'RoadGreen-App/1.0'
        }
      })

      const nominatimData = await nominatimResponse.json()
      
      if (nominatimData && nominatimData.length > 0) {
        console.log('OpenStreetMap API returned valid results')
        
        // Transform OpenStreetMap data to match our format
        const transformedData = nominatimData.map((item: any, index: number) => ({
          place_id: item.place_id || `osm_${index}`,
          display_name: item.display_name,
          lat: item.lat,
          lon: item.lon,
          type: item.type || 'place',
          importance: item.importance || 0.5,
          address: {
            road: item.address?.road,
            suburb: item.address?.suburb,
            district: item.address?.district,
            city: item.address?.city,
            state: item.address?.state,
            country: item.address?.country,
            postcode: item.address?.postcode
          }
        }))
        
        return NextResponse.json({
          success: true,
          data: transformedData,
          source: 'OpenStreetMap',
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      console.log('OpenStreetMap API failed, using mock data')
    }

    // Final fallback to mock data
    console.log('All APIs failed, using mock data')
    const mockData = generateMockAutocompleteData(q, limit)
    
    return NextResponse.json({
      success: true,
      data: mockData,
      source: 'mock_data',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Autocomplete API error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 })
  }
} 