import { type NextRequest, NextResponse } from "next/server"

const VIETMAP_API_KEY = "6856756a5a89e36f1acd124738137de6ec22f32a8b94a444"
const VIETMAP_BASE_URL = "https://maps.vietmap.vn/api"

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    // Call VietMap Geocoding API
    const geocodeUrl = `${VIETMAP_BASE_URL}/search?api-version=1.1&api-key=${VIETMAP_API_KEY}&text=${encodeURIComponent(address)}`

    const response = await fetch(geocodeUrl)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(`VietMap API error: ${response.status}`)
    }

    // Process VietMap response
    const results =
      data.data?.map((item: any) => ({
        address: item.display,
        coordinates: {
          lat: item.lat,
          lng: item.lng,
        },
        confidence: item.confidence || 1,
        place_id: item.ref_id,
      })) || []

    return NextResponse.json({
      success: true,
      results,
      total: results.length,
    })
  } catch (error) {
    console.error("Geocoding error:", error)
    return NextResponse.json({ error: "Failed to geocode address" }, { status: 500 })
  }
}
