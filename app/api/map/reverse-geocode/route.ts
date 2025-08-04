import { type NextRequest, NextResponse } from "next/server"

const VIETMAP_API_KEY = "6856756a5a89e36f1acd124738137de6ec22f32a8b94a444"
const VIETMAP_BASE_URL = "https://maps.vietmap.vn/api"

export async function POST(request: NextRequest) {
  try {
    const { lat, lng } = await request.json()

    if (!lat || !lng) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    // Call VietMap Reverse Geocoding API
    const reverseGeocodeUrl = `${VIETMAP_BASE_URL}/reverse?api-version=1.1&api-key=${VIETMAP_API_KEY}&lat=${lat}&lng=${lng}`

    const response = await fetch(reverseGeocodeUrl)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(`VietMap API error: ${response.status}`)
    }

    // Process VietMap response
    const result = data.data
      ? {
          address: data.data.display || data.data.address,
          components: {
            street: data.data.address_components?.street,
            ward: data.data.address_components?.ward,
            district: data.data.address_components?.district,
            city: data.data.address_components?.city,
            country: data.data.address_components?.country,
          },
          coordinates: {
            lat: Number.parseFloat(lat),
            lng: Number.parseFloat(lng),
          },
        }
      : null

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error("Reverse geocoding error:", error)
    return NextResponse.json({ error: "Failed to reverse geocode coordinates" }, { status: 500 })
  }
}
