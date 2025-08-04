import { type NextRequest, NextResponse } from "next/server"

const VIETMAP_API_KEY = "6856756a5a89e36f1acd124738137de6ec22f32a8b94a444"
const VIETMAP_BASE_URL = "https://maps.vietmap.vn/api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = searchParams.get("radius") || "1000" // Default 1km
    const type = searchParams.get("type") || "gas_station" // Default to gas stations

    if (!lat || !lng) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    // Call VietMap Places API
    const placesUrl = `${VIETMAP_BASE_URL}/place/nearby?api-version=1.1&api-key=${VIETMAP_API_KEY}&lat=${lat}&lng=${lng}&radius=${radius}&type=${type}`

    const response = await fetch(placesUrl)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(`VietMap API error: ${response.status}`)
    }

    // Process VietMap response
    const places =
      data.data?.map((place: any) => ({
        id: place.id,
        name: place.name,
        address: place.address,
        coordinates: {
          lat: place.lat,
          lng: place.lng,
        },
        type: place.type,
        distance: place.distance,
        rating: place.rating,
        phone: place.phone,
        website: place.website,
        openingHours: place.opening_hours,
      })) || []

    return NextResponse.json({
      success: true,
      places,
      total: places.length,
      searchParams: {
        lat: Number.parseFloat(lat),
        lng: Number.parseFloat(lng),
        radius: Number.parseInt(radius),
        type,
      },
    })
  } catch (error) {
    console.error("Nearby places error:", error)
    return NextResponse.json({ error: "Failed to get nearby places" }, { status: 500 })
  }
}
