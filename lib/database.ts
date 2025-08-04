import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "road_green",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
}

// Create connection pool
const pool = mysql.createPool(dbConfig)

export class Database {
  static async query(sql: string, params?: any[]): Promise<any> {
    try {
      const [rows] = await pool.execute(sql, params)
      return rows
    } catch (error) {
      console.error("Database query error:", error)
      throw error
    }
  }

  static async transaction(queries: Array<{ sql: string; params?: any[] }>): Promise<any[]> {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      const results = []
      for (const query of queries) {
        const [result] = await connection.execute(query.sql, query.params)
        results.push(result)
      }

      await connection.commit()
      return results
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  static async getConnection() {
    return await pool.getConnection()
  }
}

// Database Models
export class UserModel {
  static async create(userData: {
    username: string
    email: string
    password_hash: string
    full_name: string
    phone: string
    vehicle_type?: string
    driver_license?: string
    vehicle_plate?: string
  }) {
    const sql = `
      INSERT INTO users (username, email, password_hash, full_name, phone, vehicle_type, driver_license, vehicle_plate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
    const params = [
      userData.username,
      userData.email,
      userData.password_hash,
      userData.full_name,
      userData.phone,
      userData.vehicle_type || "motorbike",
      userData.driver_license,
      userData.vehicle_plate,
    ]

    const result = await Database.query(sql, params)
    return result.insertId
  }

  static async findById(id: number) {
    const sql = "SELECT * FROM users WHERE id = ?"
    const users = await Database.query(sql, [id])
    return users[0] || null
  }

  static async findByEmail(email: string) {
    const sql = "SELECT * FROM users WHERE email = ?"
    const users = await Database.query(sql, [email])
    return users[0] || null
  }

  static async findByPhone(phone: string) {
    const sql = "SELECT * FROM users WHERE phone = ?"
    const users = await Database.query(sql, [phone])
    return users[0] || null
  }

  static async updatePoints(
    userId: number,
    pointsChange: number,
    reason: string,
    referenceId?: number,
    referenceType?: string,
  ) {
    const queries = [
      {
        sql: "UPDATE users SET points = points + ? WHERE id = ?",
        params: [pointsChange, userId],
      },
      {
        sql: `INSERT INTO user_points_history (user_id, points_change, reason, reference_id, reference_type, description)
              VALUES (?, ?, ?, ?, ?, ?)`,
        params: [
          userId,
          pointsChange,
          reason,
          referenceId,
          referenceType,
          `Points ${pointsChange > 0 ? "awarded" : "deducted"} for ${reason}`,
        ],
      },
    ]

    return await Database.transaction(queries)
  }

  static async updateLocation(userId: number, latitude: number, longitude: number) {
    const sql = `
      UPDATE users 
      SET last_location_lat = ?, last_location_lng = ?, last_location_update = NOW()
      WHERE id = ?
    `
    return await Database.query(sql, [latitude, longitude, userId])
  }

  static async getLeaderboard(limit = 10) {
    const sql = `
      SELECT id, full_name, points, total_deliveries, rating, vehicle_type
      FROM users 
      WHERE status = 'active'
      ORDER BY points DESC 
      LIMIT ?
    `
    return await Database.query(sql, [limit])
  }
}

export class CustomerModel {
  static async create(customerData: {
    phone: string
    full_name: string
    address: string
    latitude?: number
    longitude?: number
    ward?: string
    district?: string
    city?: string
    email?: string
    notes?: string
  }) {
    const sql = `
      INSERT INTO customers (phone, full_name, address, latitude, longitude, ward, district, city, email, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    const params = [
      customerData.phone,
      customerData.full_name,
      customerData.address,
      customerData.latitude,
      customerData.longitude,
      customerData.ward,
      customerData.district,
      customerData.city,
      customerData.email,
      customerData.notes,
    ]

    const result = await Database.query(sql, params)
    return result.insertId
  }

  static async findByPhone(phone: string) {
    const sql = "SELECT * FROM customers WHERE phone = ?"
    const customers = await Database.query(sql, [phone])
    return customers[0] || null
  }

  static async findByAddress(address: string) {
    const sql = "SELECT * FROM customers WHERE address LIKE ?"
    const customers = await Database.query(sql, [`%${address}%`])
    return customers
  }

  static async search(searchTerm: string) {
    const sql = `
      SELECT * FROM customers 
      WHERE phone LIKE ? OR full_name LIKE ? OR address LIKE ?
      ORDER BY total_orders DESC
    `
    const searchPattern = `%${searchTerm}%`
    return await Database.query(sql, [searchPattern, searchPattern, searchPattern])
  }

  static async getDeliveryHistory(customerId: number) {
    const sql = `
      SELECT dh.*, o.order_code, u.full_name as driver_name
      FROM delivery_history dh
      JOIN orders o ON dh.order_id = o.id
      JOIN users u ON dh.driver_id = u.id
      WHERE dh.customer_id = ?
      ORDER BY dh.delivery_date DESC, dh.delivery_time DESC
    `
    return await Database.query(sql, [customerId])
  }

  static async updateOrderCount(customerId: number) {
    const sql = `
      UPDATE customers 
      SET total_orders = total_orders + 1, last_order_date = NOW()
      WHERE id = ?
    `
    return await Database.query(sql, [customerId])
  }
}

export class OrderModel {
  static async create(orderData: {
    order_code: string
    customer_id: number
    driver_id?: number
    pickup_address?: string
    pickup_latitude?: number
    pickup_longitude?: number
    delivery_address: string
    delivery_latitude?: number
    delivery_longitude?: number
    items: string
    weight?: number
    value?: number
    delivery_fee?: number
    special_instructions?: string
    priority?: string
    scheduled_time?: string
  }) {
    const sql = `
      INSERT INTO orders (
        order_code, customer_id, driver_id, pickup_address, pickup_latitude, pickup_longitude,
        delivery_address, delivery_latitude, delivery_longitude, items, weight, value,
        delivery_fee, special_instructions, priority, scheduled_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    const params = [
      orderData.order_code,
      orderData.customer_id,
      orderData.driver_id,
      orderData.pickup_address,
      orderData.pickup_latitude,
      orderData.pickup_longitude,
      orderData.delivery_address,
      orderData.delivery_latitude,
      orderData.delivery_longitude,
      orderData.items,
      orderData.weight,
      orderData.value,
      orderData.delivery_fee,
      orderData.special_instructions,
      orderData.priority || "normal",
      orderData.scheduled_time,
    ]

    const result = await Database.query(sql, params)
    return result.insertId
  }

  static async findById(id: number) {
    const sql = `
      SELECT o.*, c.full_name as customer_name, c.phone as customer_phone,
             u.full_name as driver_name, u.phone as driver_phone
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN users u ON o.driver_id = u.id
      WHERE o.id = ?
    `
    const orders = await Database.query(sql, [id])
    return orders[0] || null
  }

  static async findByDriver(driverId: number, status?: string) {
    let sql = `
      SELECT o.*, c.full_name as customer_name, c.phone as customer_phone
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.driver_id = ?
    `
    const params = [driverId]

    if (status) {
      sql += " AND o.status = ?"
      params.push(status)
    }

    sql += " ORDER BY o.scheduled_time ASC, o.created_at ASC"

    return await Database.query(sql, params)
  }

  static async updateStatus(orderId: number, status: string, additionalData?: any) {
    let sql = "UPDATE orders SET status = ?, updated_at = NOW()"
    const params = [status, orderId]

    if (status === "picked_up") {
      sql += ", picked_up_at = NOW()"
    } else if (status === "delivered") {
      sql += ", delivered_at = NOW()"
      if (additionalData?.actual_delivery_time) {
        sql += ", actual_delivery_time = ?"
        params.splice(-1, 0, additionalData.actual_delivery_time)
      }
    }

    sql += " WHERE id = ?"

    return await Database.query(sql, params)
  }

  static async getPendingOrders(limit?: number) {
    let sql = `
      SELECT o.*, c.full_name as customer_name, c.phone as customer_phone, c.address as customer_address
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.status = 'pending'
      ORDER BY o.priority DESC, o.created_at ASC
    `

    if (limit) {
      sql += " LIMIT ?"
      return await Database.query(sql, [limit])
    }

    return await Database.query(sql)
  }
}

export class TrafficReportModel {
  static async create(reportData: {
    reporter_id: number
    type: string
    severity: string
    latitude: number
    longitude: number
    address: string
    description?: string
    image_url?: string
    expires_at?: string
  }) {
    const sql = `
      INSERT INTO traffic_reports (
        reporter_id, type, severity, latitude, longitude, address, description, image_url, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    const params = [
      reportData.reporter_id,
      reportData.type,
      reportData.severity,
      reportData.latitude,
      reportData.longitude,
      reportData.address,
      reportData.description,
      reportData.image_url,
      reportData.expires_at,
    ]

    const result = await Database.query(sql, params)
    return result.insertId
  }

  static async findNearby(latitude: number, longitude: number, radiusKm = 10) {
    const sql = `
      SELECT tr.*, u.full_name as reporter_name,
             (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
              cos(radians(longitude) - radians(?)) + sin(radians(?)) * 
              sin(radians(latitude)))) AS distance_km
      FROM traffic_reports tr
      JOIN users u ON tr.reporter_id = u.id
      WHERE tr.status = 'active' 
        AND (tr.expires_at IS NULL OR tr.expires_at > NOW())
      HAVING distance_km <= ?
      ORDER BY distance_km ASC, tr.created_at DESC
    `
    return await Database.query(sql, [latitude, longitude, latitude, radiusKm])
  }

  static async vote(reportId: number, userId: number, voteType: "upvote" | "downvote") {
    const queries = [
      {
        sql: `INSERT INTO traffic_report_votes (report_id, user_id, vote_type) 
              VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE vote_type = ?`,
        params: [reportId, userId, voteType, voteType],
      },
      {
        sql: `UPDATE traffic_reports SET 
              upvotes = (SELECT COUNT(*) FROM traffic_report_votes WHERE report_id = ? AND vote_type = 'upvote'),
              downvotes = (SELECT COUNT(*) FROM traffic_report_votes WHERE report_id = ? AND vote_type = 'downvote')
              WHERE id = ?`,
        params: [reportId, reportId, reportId],
      },
    ]

    return await Database.transaction(queries)
  }

  static async verify(reportId: number, verifierId: number) {
    const sql = `
      UPDATE traffic_reports 
      SET verified = TRUE, verified_by = ?, verified_at = NOW()
      WHERE id = ?
    `
    return await Database.query(sql, [verifierId, reportId])
  }

  static async getActiveReports(limit?: number) {
    let sql = `
      SELECT tr.*, u.full_name as reporter_name
      FROM traffic_reports tr
      JOIN users u ON tr.reporter_id = u.id
      WHERE tr.status = 'active' 
        AND (tr.expires_at IS NULL OR tr.expires_at > NOW())
      ORDER BY tr.severity DESC, tr.created_at DESC
    `

    if (limit) {
      sql += " LIMIT ?"
      return await Database.query(sql, [limit])
    }

    return await Database.query(sql)
  }
}

export class RouteModel {
  static async create(routeData: {
    driver_id: number
    route_name?: string
    start_latitude?: number
    start_longitude?: number
    start_address?: string
    total_orders: number
    total_distance_km?: number
    estimated_time_minutes?: number
  }) {
    const sql = `
      INSERT INTO routes (
        driver_id, route_name, start_latitude, start_longitude, start_address,
        total_orders, total_distance_km, estimated_time_minutes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
    const params = [
      routeData.driver_id,
      routeData.route_name,
      routeData.start_latitude,
      routeData.start_longitude,
      routeData.start_address,
      routeData.total_orders,
      routeData.total_distance_km,
      routeData.estimated_time_minutes,
    ]

    const result = await Database.query(sql, params)
    return result.insertId
  }

  static async addOrderToRoute(
    routeId: number,
    orderId: number,
    sequenceNumber: number,
    estimatedArrivalTime?: string,
  ) {
    const sql = `
      INSERT INTO route_orders (route_id, order_id, sequence_number, estimated_arrival_time)
      VALUES (?, ?, ?, ?)
    `
    return await Database.query(sql, [routeId, orderId, sequenceNumber, estimatedArrivalTime])
  }

  static async getRouteWithOrders(routeId: number) {
    const sql = `
      SELECT r.*, 
             ro.sequence_number, ro.estimated_arrival_time, ro.actual_arrival_time,
             o.*, c.full_name as customer_name, c.phone as customer_phone
      FROM routes r
      LEFT JOIN route_orders ro ON r.id = ro.route_id
      LEFT JOIN orders o ON ro.order_id = o.id
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE r.id = ?
      ORDER BY ro.sequence_number ASC
    `
    return await Database.query(sql, [routeId])
  }

  static async updateRouteStatus(routeId: number, status: string) {
    let sql = "UPDATE routes SET status = ?, updated_at = NOW()"
    const params = [status, routeId]

    if (status === "completed") {
      sql += ", completed_at = NOW()"
    }

    sql += " WHERE id = ?"

    return await Database.query(sql, params)
  }
}

export class NotificationModel {
  static async create(notificationData: {
    user_id: number
    title: string
    message: string
    type: string
    action_url?: string
    reference_id?: number
    reference_type?: string
  }) {
    const sql = `
      INSERT INTO notifications (user_id, title, message, type, action_url, reference_id, reference_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    const params = [
      notificationData.user_id,
      notificationData.title,
      notificationData.message,
      notificationData.type,
      notificationData.action_url,
      notificationData.reference_id,
      notificationData.reference_type,
    ]

    const result = await Database.query(sql, params)
    return result.insertId
  }

  static async getUserNotifications(userId: number, limit = 20) {
    const sql = `
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `
    return await Database.query(sql, [userId, limit])
  }

  static async markAsRead(notificationId: number) {
    const sql = "UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ?"
    return await Database.query(sql, [notificationId])
  }

  static async getUnreadCount(userId: number) {
    const sql = "SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE"
    const result = await Database.query(sql, [userId])
    return result[0].unread_count
  }
}
