import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { verifyToken } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "today" // today, week, month, year
    const driverId = searchParams.get("driver_id")

    let dateFilter = ""
    const dateParams = []

    switch (period) {
      case "today":
        dateFilter = "DATE(created_at) = CURDATE()"
        break
      case "week":
        dateFilter = "created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
        break
      case "month":
        dateFilter = "created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
        break
      case "year":
        dateFilter = "created_at >= DATE_SUB(NOW(), INTERVAL 365 DAY)"
        break
    }

    // Get order statistics
    const orderStats = await getOrderStatistics(dateFilter, driverId)

    // Get delivery performance
    const deliveryPerformance = await getDeliveryPerformance(dateFilter, driverId)

    // Get traffic report statistics
    const trafficStats = await getTrafficReportStatistics(dateFilter, driverId)

    // Get revenue statistics
    const revenueStats = await getRevenueStatistics(dateFilter, driverId)

    // Get top performers
    const topPerformers = await getTopPerformers(dateFilter)

    // Get recent activities
    const recentActivities = await getRecentActivities(driverId, 10)

    return NextResponse.json({
      success: true,
      period,
      statistics: {
        orders: orderStats,
        delivery_performance: deliveryPerformance,
        traffic_reports: trafficStats,
        revenue: revenueStats,
        top_performers: topPerformers,
        recent_activities: recentActivities,
      },
    })
  } catch (error) {
    console.error("Analytics dashboard error:", error)
    return NextResponse.json({ error: "Failed to get analytics data" }, { status: 500 })
  }
}

async function getOrderStatistics(dateFilter: string, driverId?: string) {
  let sql = `
    SELECT 
      COUNT(*) as total_orders,
      COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_orders,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
      AVG(CASE WHEN status = 'delivered' AND actual_delivery_time IS NOT NULL 
          THEN actual_delivery_time END) as avg_delivery_time,
      SUM(CASE WHEN status = 'delivered' THEN distance_km END) as total_distance
    FROM orders 
    WHERE ${dateFilter}
  `

  const params = []
  if (driverId) {
    sql += " AND driver_id = ?"
    params.push(driverId)
  }

  const result = await Database.query(sql, params)
  return result[0]
}

async function getDeliveryPerformance(dateFilter: string, driverId?: string) {
  let sql = `
    SELECT 
      COUNT(*) as total_deliveries,
      AVG(actual_delivery_time) as avg_delivery_time,
      MIN(actual_delivery_time) as fastest_delivery,
      MAX(actual_delivery_time) as slowest_delivery,
      COUNT(CASE WHEN actual_delivery_time <= estimated_delivery_time THEN 1 END) as on_time_deliveries,
      AVG(CASE WHEN estimated_delivery_time > 0 
          THEN (actual_delivery_time / estimated_delivery_time) * 100 END) as time_efficiency_percent
    FROM orders 
    WHERE status = 'delivered' AND ${dateFilter}
  `

  const params = []
  if (driverId) {
    sql += " AND driver_id = ?"
    params.push(driverId)
  }

  const result = await Database.query(sql, params)
  return result[0]
}

async function getTrafficReportStatistics(dateFilter: string, driverId?: string) {
  let sql = `
    SELECT 
      COUNT(*) as total_reports,
      COUNT(CASE WHEN verified = TRUE THEN 1 END) as verified_reports,
      COUNT(CASE WHEN type = 'flood' THEN 1 END) as flood_reports,
      COUNT(CASE WHEN type = 'traffic_jam' THEN 1 END) as traffic_reports,
      AVG(upvotes) as avg_upvotes,
      SUM(upvotes) as total_upvotes
    FROM traffic_reports 
    WHERE ${dateFilter}
  `

  const params = []
  if (driverId) {
    sql += " AND reporter_id = ?"
    params.push(driverId)
  }

  const result = await Database.query(sql, params)
  return result[0]
}

async function getRevenueStatistics(dateFilter: string, driverId?: string) {
  let sql = `
    SELECT 
      COUNT(*) as total_orders,
      SUM(delivery_fee) as total_revenue,
      AVG(delivery_fee) as avg_order_value,
      SUM(CASE WHEN status = 'delivered' THEN delivery_fee ELSE 0 END) as completed_revenue
    FROM orders 
    WHERE ${dateFilter}
  `

  const params = []
  if (driverId) {
    sql += " AND driver_id = ?"
    params.push(driverId)
  }

  const result = await Database.query(sql, params)
  return result[0]
}

async function getTopPerformers(dateFilter: string) {
  const sql = `
    SELECT 
      u.id, u.full_name, u.points,
      COUNT(o.id) as deliveries_count,
      AVG(o.actual_delivery_time) as avg_delivery_time,
      SUM(o.distance_km) as total_distance,
      COUNT(tr.id) as traffic_reports_count
    FROM users u
    LEFT JOIN orders o ON u.id = o.driver_id AND o.status = 'delivered' AND ${dateFilter}
    LEFT JOIN traffic_reports tr ON u.id = tr.reporter_id AND ${dateFilter}
    WHERE u.status = 'active'
    GROUP BY u.id, u.full_name, u.points
    ORDER BY u.points DESC, deliveries_count DESC
    LIMIT 10
  `

  return await Database.query(sql)
}

async function getRecentActivities(driverId?: string, limit = 10) {
  const sql = `
    (SELECT 'order' as type, id, created_at, 
            CONCAT('Đơn hàng #', order_code, ' - ', status) as description
     FROM orders 
     WHERE ${driverId ? "driver_id = ?" : "1=1"}
     ORDER BY created_at DESC LIMIT ?)
    UNION ALL
    (SELECT 'traffic_report' as type, id, created_at,
            CONCAT('Báo cáo ', type, ' tại ', LEFT(address, 50)) as description
     FROM traffic_reports 
     WHERE ${driverId ? "reporter_id = ?" : "1=1"}
     ORDER BY created_at DESC LIMIT ?)
    ORDER BY created_at DESC
    LIMIT ?
  `

  const params = driverId ? [driverId, limit, driverId, limit, limit] : [limit, limit, limit]

  return await Database.query(sql, params)
}
