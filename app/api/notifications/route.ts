import { type NextRequest, NextResponse } from "next/server"
import { NotificationModel } from "@/lib/database"
import { verifyToken } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const unreadOnly = searchParams.get("unread_only") === "true"

    let notifications
    if (unreadOnly) {
      notifications = await NotificationModel.getUserNotifications(token.userId, limit)
      notifications = notifications.filter((n) => !n.is_read)
    } else {
      notifications = await NotificationModel.getUserNotifications(token.userId, limit)
    }

    const unreadCount = await NotificationModel.getUnreadCount(token.userId)

    return NextResponse.json({
      success: true,
      notifications,
      unread_count: unreadCount,
      total: notifications.length,
    })
  } catch (error) {
    console.error("Get notifications error:", error)
    return NextResponse.json({ error: "Failed to get notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, message, type, action_url, reference_id, reference_type } = await request.json()

    if (!title || !message || !type) {
      return NextResponse.json({ error: "Title, message, and type are required" }, { status: 400 })
    }

    const notificationId = await NotificationModel.create({
      user_id: token.userId,
      title,
      message,
      type,
      action_url,
      reference_id,
      reference_type,
    })

    return NextResponse.json(
      {
        success: true,
        message: "Notification created successfully",
        notification_id: notificationId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create notification error:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { notification_id } = await request.json()

    if (!notification_id) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 })
    }

    await NotificationModel.markAsRead(notification_id)

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
    })
  } catch (error) {
    console.error("Update notification error:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}
