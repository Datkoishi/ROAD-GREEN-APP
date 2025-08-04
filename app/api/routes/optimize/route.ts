import { type NextRequest, NextResponse } from "next/server"
import { RouteModel } from "@/lib/database"
import { verifyToken } from "@/lib/auth-middleware"

interface OptimizationRequest {
  orders: Array<{
    id: number
    address: string
    coordinates?: { lat: number; lng: number }
    priority: string
  }>
  start_location?: { lat: number; lng: number }
  vehicle_type?: string
  max_orders?: number
}

export async function POST(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orders, start_location, vehicle_type, max_orders = 20 }: OptimizationRequest = await request.json()

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: "Orders array is required" }, { status: 400 })
    }

    // Limit number of orders for optimization
    const limitedOrders = orders.slice(0, max_orders)

    // Get traffic reports for route optimization
    const trafficReports = await getActiveTrafficReports()

    // Optimize route using advanced algorithm
    const optimizedRoute = await optimizeDeliveryRoute(limitedOrders, start_location, vehicle_type, trafficReports)

    // Create route record in database
    const routeId = await RouteModel.create({
      driver_id: token.userId,
      route_name: `Route ${new Date().toLocaleDateString()}`,
      start_latitude: start_location?.lat,
      start_longitude: start_location?.lng,
      total_orders: optimizedRoute.length,
      total_distance_km: optimizedRoute.reduce((sum, r) => sum + r.distance_km, 0),
      estimated_time_minutes: optimizedRoute.reduce((sum, r) => sum + r.estimated_time_minutes, 0),
    })

    // Add orders to route
    for (let i = 0; i < optimizedRoute.length; i++) {
      const routeOrder = optimizedRoute[i]
      await RouteModel.addOrderToRoute(routeId, routeOrder.order_id, i + 1, routeOrder.estimated_arrival_time)
    }

    // Calculate savings compared to non-optimized route
    const savings = calculateRouteSavings(orders, optimizedRoute)

    return NextResponse.json({
      success: true,
      route_id: routeId,
      optimized_route: optimizedRoute,
      total_distance_km: optimizedRoute.reduce((sum, r) => sum + r.distance_km, 0),
      total_time_minutes: optimizedRoute.reduce((sum, r) => sum + r.estimated_time_minutes, 0),
      fuel_cost_estimate: calculateFuelCost(optimizedRoute, vehicle_type),
      savings,
      traffic_considerations: trafficReports.length,
    })
  } catch (error) {
    console.error("Route optimization error:", error)
    return NextResponse.json({ error: "Failed to optimize route" }, { status: 500 })
  }
}

async function optimizeDeliveryRoute(
  orders: any[],
  startLocation?: { lat: number; lng: number },
  vehicleType?: string,
  trafficReports: any[] = [],
) {
  // Advanced route optimization algorithm
  const optimized = []
  const unvisited = [...orders]
  let currentLocation = startLocation || orders[0].coordinates

  // Priority-based initial sorting
  unvisited.sort((a, b) => {
    const priorityWeight = { urgent: 4, high: 3, normal: 2, low: 1 }
    return (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2)
  })

  let sequence = 1
  let totalTime = 0

  while (unvisited.length > 0) {
    let bestIndex = 0
    let bestScore = -1

    for (let i = 0; i < unvisited.length; i++) {
      const order = unvisited[i]
      if (!order.coordinates) continue

      // Calculate base distance
      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        order.coordinates.lat,
        order.coordinates.lng,
      )

      // Apply traffic penalties
      const trafficPenalty = calculateTrafficPenalty(order.coordinates, trafficReports)

      // Apply priority bonus
      const priorityBonus = getPriorityBonus(order.priority)

      // Apply vehicle type factor
      const vehicleFactor = getVehicleFactor(vehicleType, distance)

      // Calculate composite score (lower is better)
      const score = distance * trafficPenalty * vehicleFactor - priorityBonus

      if (bestScore === -1 || score < bestScore) {
        bestScore = score
        bestIndex = i
      }
    }

    const selectedOrder = unvisited.splice(bestIndex, 1)[0]
    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      selectedOrder.coordinates.lat,
      selectedOrder.coordinates.lng,
    )

    const estimatedTime = Math.round((distance * 60) / getAverageSpeed(vehicleType)) // Convert to minutes
    totalTime += estimatedTime

    optimized.push({
      order_id: selectedOrder.id,
      sequence,
      address: selectedOrder.address,
      coordinates: selectedOrder.coordinates,
      distance_km: distance,
      estimated_time_minutes: estimatedTime,
      estimated_arrival_time: new Date(Date.now() + totalTime * 60000).toISOString(),
      traffic_conditions: getTrafficConditions(selectedOrder.coordinates, trafficReports),
    })

    currentLocation = selectedOrder.coordinates
    sequence++
  }

  return optimized
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

function calculateTrafficPenalty(coordinates: { lat: number; lng: number }, trafficReports: any[]): number {
  let penalty = 1.0

  for (const report of trafficReports) {
    const distance = calculateDistance(coordinates.lat, coordinates.lng, report.latitude, report.longitude)

    if (distance <= 2) {
      // Within 2km of traffic report
      const severityMultiplier = {
        low: 1.1,
        medium: 1.3,
        high: 1.6,
        critical: 2.0,
      }
      penalty *= severityMultiplier[report.severity] || 1.2
    }
  }

  return penalty
}

function getPriorityBonus(priority: string): number {
  const bonuses = { urgent: 10, high: 5, normal: 0, low: -2 }
  return bonuses[priority] || 0
}

function getVehicleFactor(vehicleType: string, distance: number): number {
  const factors = {
    motorbike: distance < 5 ? 0.8 : 1.2, // Better for short distances
    car: 1.0,
    truck: distance > 10 ? 0.9 : 1.3, // Better for long distances
  }
  return factors[vehicleType] || 1.0
}

function getAverageSpeed(vehicleType: string): number {
  const speeds = { motorbike: 25, car: 30, truck: 25 } // km/h in city traffic
  return speeds[vehicleType] || 25
}

function getTrafficConditions(coordinates: { lat: number; lng: number }, trafficReports: any[]): string {
  const nearbyReports = trafficReports.filter((report) => {
    const distance = calculateDistance(coordinates.lat, coordinates.lng, report.latitude, report.longitude)
    return distance <= 1 // Within 1km
  })

  if (nearbyReports.length === 0) return "normal"

  const maxSeverity = Math.max(
    ...nearbyReports.map((r) => {
      const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 }
      return severityLevels[r.severity] || 2
    }),
  )

  const severityNames = { 1: "low", 2: "medium", 3: "high", 4: "critical" }
  return severityNames[maxSeverity] || "normal"
}

function calculateFuelCost(route: any[], vehicleType: string): number {
  const totalDistance = route.reduce((sum, r) => sum + r.distance_km, 0)
  const fuelConsumption = { motorbike: 2.5, car: 8, truck: 12 } // liters per 100km
  const fuelPrice = 25000 // VND per liter

  const consumption = fuelConsumption[vehicleType] || 5
  return Math.round((totalDistance * consumption * fuelPrice) / 100)
}

function calculateRouteSavings(originalOrders: any[], optimizedRoute: any[]) {
  // Simulate non-optimized route (sequential order)
  const originalDistance = originalOrders.reduce((sum, _, index) => {
    if (index === 0) return 0
    return (
      sum +
      calculateDistance(
        originalOrders[index - 1].coordinates?.lat || 0,
        originalOrders[index - 1].coordinates?.lng || 0,
        originalOrders[index].coordinates?.lat || 0,
        originalOrders[index].coordinates?.lng || 0,
      )
    )
  }, 0)

  const optimizedDistance = optimizedRoute.reduce((sum, r) => sum + r.distance_km, 0)
  const distanceSaved = Math.max(0, originalDistance - optimizedDistance)
  const timeSaved = Math.round(distanceSaved * 2.4) // Approximate time savings in minutes

  return {
    distance_saved_km: Math.round(distanceSaved * 10) / 10,
    time_saved_minutes: timeSaved,
    fuel_saved_vnd: Math.round(distanceSaved * 2000), // Approximate fuel savings
    efficiency_improvement: Math.round((distanceSaved / Math.max(originalDistance, 1)) * 100),
  }
}

async function getActiveTrafficReports() {
  try {
    const { TrafficReportModel } = await import("@/lib/database")
    return await TrafficReportModel.getActiveReports(50)
  } catch (error) {
    console.error("Failed to get traffic reports:", error)
    return []
  }
}
