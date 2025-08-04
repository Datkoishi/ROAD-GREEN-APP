import { type NextRequest, NextResponse } from "next/server"

interface TrafficReport {
  id: string
  type: "flood" | "traffic"
  location: string
  coordinates: {
    lat: number
    lng: number
  }
  reporter: string
  timestamp: string
  verified: boolean
  votes: number
  description: string
  severity: "low" | "medium" | "high"
}

// In-memory storage (in production, use a database)
const trafficReports: TrafficReport[] = [
  {
    id: "1",
    type: "flood",
    location: "Đường Nguyễn Văn Linh, Quận 7",
    coordinates: { lat: 10.7379, lng: 106.7017 },
    reporter: "Tài xế A",
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    verified: true,
    votes: 5,
    description: "Ngập nước sâu khoảng 30cm, xe máy khó di chuyển",
    severity: "high",
  },
  {
    id: "2",
    type: "traffic",
    location: "Cầu Sài Gòn, hướng Quận 1",
    coordinates: { lat: 10.7626, lng: 106.7025 },
    reporter: "Tài xế B",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    verified: true,
    votes: 8,
    description: "Kẹt xe nghiêm trọng do tai nạn giao thông",
    severity: "high",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = Number.parseFloat(searchParams.get("radius") || "10") // Default 10km radius

    let filteredReports = trafficReports

    // Filter by location if coordinates provided
    if (lat && lng) {
      const centerLat = Number.parseFloat(lat)
      const centerLng = Number.parseFloat(lng)

      filteredReports = trafficReports.filter((report) => {
        const distance = calculateDistance(centerLat, centerLng, report.coordinates.lat, report.coordinates.lng)
        return distance <= radius
      })
    }

    // Sort by timestamp (newest first)
    filteredReports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      success: true,
      reports: filteredReports,
      total: filteredReports.length,
    })
  } catch (error) {
    console.error("Get traffic reports error:", error)
    return NextResponse.json({ error: "Failed to get traffic reports" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, location, coordinates, description, reporter } = await request.json()

    if (!type || !location || !coordinates || !reporter) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newReport: TrafficReport = {
      id: Date.now().toString(),
      type,
      location,
      coordinates,
      reporter,
      description: description || `Báo cáo ${type === "flood" ? "ngập nước" : "kẹt xe"}`,
      timestamp: new Date().toISOString(),
      verified: false,
      votes: 0,
      severity: "medium",
    }

    trafficReports.unshift(newReport)

    // Auto-verify reports from trusted users (simulation)
    if (Math.random() > 0.3) {
      setTimeout(() => {
        const reportIndex = trafficReports.findIndex((r) => r.id === newReport.id)
        if (reportIndex !== -1) {
          trafficReports[reportIndex].verified = true
        }
      }, 30000) // Verify after 30 seconds
    }

    return NextResponse.json({
      success: true,
      report: newReport,
      pointsAwarded: 10,
    })
  } catch (error) {
    console.error("Create traffic report error:", error)
    return NextResponse.json({ error: "Failed to create traffic report" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { reportId, action, userId } = await request.json()

    if (!reportId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const reportIndex = trafficReports.findIndex((r) => r.id === reportId)
    if (reportIndex === -1) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    let pointsAwarded = 0

    switch (action) {
      case "upvote":
        trafficReports[reportIndex].votes += 1
        pointsAwarded = 2
        break
      case "downvote":
        trafficReports[reportIndex].votes -= 1
        pointsAwarded = -1
        break
      case "verify":
        trafficReports[reportIndex].verified = true
        pointsAwarded = 5
        break
      case "flag_false":
        // Mark as false report and penalize original reporter
        trafficReports[reportIndex].votes -= 10
        pointsAwarded = -20
        break
    }

    return NextResponse.json({
      success: true,
      report: trafficReports[reportIndex],
      pointsAwarded,
    })
  } catch (error) {
    console.error("Update traffic report error:", error)
    return NextResponse.json({ error: "Failed to update traffic report" }, { status: 500 })
  }
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
