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

    // Mock geocoding data for demo purposes
    const mockResults = [
      {
        address: address,
        latitude: 10.7729,
        longitude: 106.6984,
        display_name: `${address}, Quận 1, TP.HCM`,
        type: 'place',
        importance: 0.8
      },
      {
        address: address,
        latitude: 10.7884,
        longitude: 106.7056,
        display_name: `${address}, Quận 3, TP.HCM`,
        type: 'place',
        importance: 0.7
      },
      {
        address: address,
        latitude: 10.7379,
        longitude: 106.7017,
        display_name: `${address}, Quận 7, TP.HCM`,
        type: 'place',
        importance: 0.6
      }
    ]

    // Filter results based on address similarity
    const results = mockResults.filter(result => 
      result.display_name.toLowerCase().includes(address.toLowerCase()) ||
      address.toLowerCase().includes('bến') ||
      address.toLowerCase().includes('phu my') ||
      address.toLowerCase().includes('vo thi')
    )

    return NextResponse.json({
      success: true,
      data: {
        query: address,
        results: results,
        total: results.length
      }
    })

  } catch (error) {
    console.error("Geocoding error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 })
  }
} 