import { type NextRequest, NextResponse } from "next/server"
import { OrderModel, CustomerModel, UserModel, NotificationModel } from "@/lib/database"
import { verifyToken } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const driverId = searchParams.get("driver_id")
    const limit = searchParams.get("limit")

    let orders

    if (driverId) {
      orders = await OrderModel.findByDriver(Number.parseInt(driverId), status || undefined)
    } else if (status === "pending") {
      orders = await OrderModel.getPendingOrders(limit ? Number.parseInt(limit) : undefined)
    } else {
      // Get all orders with pagination
      orders = await OrderModel.getPendingOrders(limit ? Number.parseInt(limit) : 50)
    }

    return NextResponse.json({
      success: true,
      orders,
      total: orders.length,
    })
  } catch (error) {
    console.error("Get orders error:", error)
    return NextResponse.json({ error: "Failed to get orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      customer_phone,
      customer_name,
      customer_email,
      pickup_address,
      pickup_coordinates,
      delivery_address,
      delivery_coordinates,
      items,
      weight,
      value,
      delivery_fee,
      special_instructions,
      priority,
      scheduled_time,
    } = await request.json()

    if (!customer_phone || !customer_name || !delivery_address || !items) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Find or create customer
    const customer = await CustomerModel.findByPhone(customer_phone)
    let customerId

    if (customer) {
      customerId = customer.id
      // Update customer order count
      await CustomerModel.updateOrderCount(customerId)
    } else {
      // Create new customer
      customerId = await CustomerModel.create({
        phone: customer_phone,
        full_name: customer_name,
        email: customer_email,
        address: delivery_address,
        latitude: delivery_coordinates?.lat,
        longitude: delivery_coordinates?.lng,
      })
    }

    // Generate order code
    const order_code = `RG${Date.now()}`

    // Create order
    const orderId = await OrderModel.create({
      order_code,
      customer_id: customerId,
      pickup_address,
      pickup_latitude: pickup_coordinates?.lat,
      pickup_longitude: pickup_coordinates?.lng,
      delivery_address,
      delivery_latitude: delivery_coordinates?.lat,
      delivery_longitude: delivery_coordinates?.lng,
      items,
      weight,
      value,
      delivery_fee,
      special_instructions,
      priority,
      scheduled_time,
    })

    // Get the created order
    const order = await OrderModel.findById(orderId)

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        order,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { order_id, status, driver_id, actual_delivery_time, delivery_notes } = await request.json()

    if (!order_id || !status) {
      return NextResponse.json({ error: "Order ID and status are required" }, { status: 400 })
    }

    // Update order status
    await OrderModel.updateStatus(order_id, status, { actual_delivery_time })

    // If assigning to driver, update driver_id
    if (driver_id && status === "assigned") {
      await OrderModel.updateStatus(order_id, status)

      // Create notification for driver
      await NotificationModel.create({
        user_id: driver_id,
        title: "Đơn hàng mới",
        message: `Bạn đã được giao đơn hàng #${order_id}`,
        type: "info",
        reference_id: order_id,
        reference_type: "order",
      })
    }

    // If order is delivered, award points to driver
    if (status === "delivered" && driver_id) {
      await UserModel.updatePoints(driver_id, 10, "delivery_completed", order_id, "order")
    }

    const updatedOrder = await OrderModel.findById(order_id)

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    })
  } catch (error) {
    console.error("Update order error:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
