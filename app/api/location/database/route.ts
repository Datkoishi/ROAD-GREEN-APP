import { NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"

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
    const type = searchParams.get('type') || 'all' // all, users, customers, traffic_reports
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let results: any = {}

    switch (type) {
      case 'users':
        // Get users with location data
        const usersQuery = `
          SELECT 
            id, username, full_name, phone, vehicle_type,
            last_location_lat, last_location_lng, last_location_update,
            points, total_deliveries, rating, status
          FROM users 
          WHERE last_location_lat IS NOT NULL AND last_location_lng IS NOT NULL
          ORDER BY last_location_update DESC
          LIMIT ? OFFSET ?
        `
        const usersData = await Database.query(usersQuery, [limit, offset])
        results.users = usersData
        break

      case 'customers':
        // Get customers with location data
        const customersQuery = `
          SELECT 
            id, phone, full_name, email, address,
            latitude, longitude, ward, district, city,
            total_orders, last_order_date, customer_type
          FROM customers 
          WHERE latitude IS NOT NULL AND longitude IS NOT NULL
          ORDER BY total_orders DESC
          LIMIT ? OFFSET ?
        `
        const customersData = await Database.query(customersQuery, [limit, offset])
        results.customers = customersData
        break

      case 'traffic_reports':
        // Get recent traffic reports with location
        const trafficQuery = `
          SELECT 
            tr.id, tr.type, tr.severity, tr.latitude, tr.longitude,
            tr.address, tr.description, tr.verified, tr.upvotes, tr.downvotes,
            tr.status, tr.created_at,
            u.full_name as reporter_name
          FROM traffic_reports tr
          LEFT JOIN users u ON tr.reporter_id = u.id
          WHERE tr.status = 'active'
          ORDER BY tr.created_at DESC
          LIMIT ? OFFSET ?
        `
        const trafficReportsData = await Database.query(trafficQuery, [limit, offset])
        results.traffic_reports = trafficReportsData
        break

      case 'orders':
        // Get orders with pickup and delivery locations
        const ordersQuery = `
          SELECT 
            o.id, o.order_code, o.pickup_address, o.pickup_latitude, o.pickup_longitude,
            o.delivery_address, o.delivery_latitude, o.delivery_longitude,
            o.status, o.scheduled_time, o.distance_km,
            c.full_name as customer_name, c.phone as customer_phone,
            u.full_name as driver_name, u.phone as driver_phone
          FROM orders o
          LEFT JOIN customers c ON o.customer_id = c.id
          LEFT JOIN users u ON o.driver_id = u.id
          WHERE o.pickup_latitude IS NOT NULL AND o.pickup_longitude IS NOT NULL
          ORDER BY o.created_at DESC
          LIMIT ? OFFSET ?
        `
        const ordersData = await Database.query(ordersQuery, [limit, offset])
        results.orders = ordersData
        break

      case 'all':
      default:
        // Get all location data
        const [users, customers, trafficReports, orders] = await Promise.all([
          Database.query(`
            SELECT 
              id, username, full_name, phone, vehicle_type,
              last_location_lat, last_location_lng, last_location_update,
              points, total_deliveries, rating, status
            FROM users 
            WHERE last_location_lat IS NOT NULL AND last_location_lng IS NOT NULL
            ORDER BY last_location_update DESC
            LIMIT ? OFFSET ?
          `, [limit, offset]),
          
          Database.query(`
            SELECT 
              id, phone, full_name, email, address,
              latitude, longitude, ward, district, city,
              total_orders, last_order_date, customer_type
            FROM customers 
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL
            ORDER BY total_orders DESC
            LIMIT ? OFFSET ?
          `, [limit, offset]),
          
          Database.query(`
            SELECT 
              tr.id, tr.type, tr.severity, tr.latitude, tr.longitude,
              tr.address, tr.description, tr.verified, tr.upvotes, tr.downvotes,
              tr.status, tr.created_at,
              u.full_name as reporter_name
            FROM traffic_reports tr
            LEFT JOIN users u ON tr.reporter_id = u.id
            WHERE tr.status = 'active'
            ORDER BY tr.created_at DESC
            LIMIT ? OFFSET ?
          `, [limit, offset]),
          
          Database.query(`
            SELECT 
              o.id, o.order_code, o.pickup_address, o.pickup_latitude, o.pickup_longitude,
              o.delivery_address, o.delivery_latitude, o.delivery_longitude,
              o.status, o.scheduled_time, o.distance_km,
              c.full_name as customer_name, c.phone as customer_phone,
              u.full_name as driver_name, u.phone as driver_phone
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.id
            LEFT JOIN users u ON o.driver_id = u.id
            WHERE o.pickup_latitude IS NOT NULL AND o.pickup_longitude IS NOT NULL
            ORDER BY o.created_at DESC
            LIMIT ? OFFSET ?
          `, [limit, offset])
        ])

        results = {
          users,
          customers,
          traffic_reports: trafficReports,
          orders
        }
        break
    }

    // Get summary statistics
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE last_location_lat IS NOT NULL) as users_with_location,
        (SELECT COUNT(*) FROM customers WHERE latitude IS NOT NULL) as customers_with_location,
        (SELECT COUNT(*) FROM traffic_reports WHERE status = 'active') as active_traffic_reports,
        (SELECT COUNT(*) FROM orders WHERE pickup_latitude IS NOT NULL) as orders_with_location
    `
    const stats = await Database.query(statsQuery)

    return NextResponse.json({
      success: true,
      data: {
        locations: results,
        statistics: stats[0],
        pagination: {
          limit,
          offset,
          type
        },
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error("Location database API error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 })
  }
} 