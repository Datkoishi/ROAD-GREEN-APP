"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Truck, Clock, Package, DollarSign, Bell, Activity, BarChart3, Settings } from "lucide-react"

interface DashboardStats {
  orders: {
    total_orders: number
    completed_orders: number
    cancelled_orders: number
    pending_orders: number
    avg_delivery_time: number
    total_distance: number
  }
  delivery_performance: {
    total_deliveries: number
    avg_delivery_time: number
    fastest_delivery: number
    slowest_delivery: number
    on_time_deliveries: number
    time_efficiency_percent: number
  }
  traffic_reports: {
    total_reports: number
    verified_reports: number
    flood_reports: number
    traffic_reports: number
    avg_upvotes: number
    total_upvotes: number
  }
  revenue: {
    total_orders: number
    total_revenue: number
    avg_order_value: number
    completed_revenue: number
  }
}

export default function EnhancedDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("today")

  useEffect(() => {
    fetchDashboardData()
    fetchNotifications()
  }, [period])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/dashboard?period=${period}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.statistics)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications?limit=5", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ notification_id: notificationId }),
      })

      fetchNotifications() // Refresh notifications
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Truck className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Road Green Dashboard</h1>
                <p className="text-sm text-gray-600">Hệ thống quản lý giao hàng thông minh</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="today">Hôm nay</option>
                <option value="week">7 ngày qua</option>
                <option value="month">30 ngày qua</option>
                <option value="year">1 năm qua</option>
              </select>

              <div className="relative">
                <Button variant="outline" size="sm" className="relative bg-transparent">
                  <Bell className="h-4 w-4" />
                  {notifications.filter((n) => !n.is_read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.filter((n) => !n.is_read).length}
                    </span>
                  )}
                </Button>
              </div>

              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Cài đặt
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
            <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
            <TabsTrigger value="traffic">Giao thông</TabsTrigger>
            <TabsTrigger value="analytics">Phân tích</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.orders.total_orders || 0}</div>
                  <p className="text-xs text-muted-foreground">{stats?.orders.completed_orders || 0} đã hoàn thành</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(stats?.revenue.completed_revenue || 0).toLocaleString("vi-VN")}đ
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Trung bình {(stats?.revenue.avg_order_value || 0).toLocaleString("vi-VN")}đ/đơn
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Thời gian giao</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(stats?.delivery_performance.avg_delivery_time || 0)} phút
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Hiệu suất {Math.round(stats?.delivery_performance.time_efficiency_percent || 0)}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Báo cáo giao thông</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.traffic_reports.total_reports || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.traffic_reports.verified_reports || 0} đã xác thực
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hoạt động gần đây</CardTitle>
                  <CardDescription>Các hoạt động mới nhất của bạn</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.slice(0, 5).map((notification: any) => (
                      <div key={notification.id} className="flex items-start space-x-3">
                        <div
                          className={`p-2 rounded-full ${
                            notification.type === "success"
                              ? "bg-green-100 text-green-600"
                              : notification.type === "warning"
                                ? "bg-yellow-100 text-yellow-600"
                                : notification.type === "error"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          <Activity className="h-3 w-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-500">{notification.message}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(notification.created_at).toLocaleString("vi-VN")}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <Button variant="ghost" size="sm" onClick={() => markNotificationAsRead(notification.id)}>
                            Đánh dấu đã đọc
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Thống kê hiệu suất</CardTitle>
                  <CardDescription>Phân tích hiệu suất giao hàng</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Đơn hàng hoàn thành</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${((stats?.orders.completed_orders || 0) / Math.max(stats?.orders.total_orders || 1, 1)) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round(
                            ((stats?.orders.completed_orders || 0) / Math.max(stats?.orders.total_orders || 1, 1)) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Giao hàng đúng giờ</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${((stats?.delivery_performance.on_time_deliveries || 0) / Math.max(stats?.delivery_performance.total_deliveries || 1, 1)) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round(
                            ((stats?.delivery_performance.on_time_deliveries || 0) /
                              Math.max(stats?.delivery_performance.total_deliveries || 1, 1)) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Báo cáo được xác thực</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full"
                            style={{
                              width: `${((stats?.traffic_reports.verified_reports || 0) / Math.max(stats?.traffic_reports.total_reports || 1, 1)) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round(
                            ((stats?.traffic_reports.verified_reports || 0) /
                              Math.max(stats?.traffic_reports.total_reports || 1, 1)) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Đơn hàng hoàn thành</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.orders.completed_orders || 0}</div>
                  <p className="text-sm text-gray-600">
                    Tổng quãng đường: {(stats?.orders.total_distance || 0).toFixed(1)} km
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-yellow-600">Đơn hàng chờ xử lý</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.orders.pending_orders || 0}</div>
                  <p className="text-sm text-gray-600">Cần được xử lý</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Đơn hàng bị hủy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.orders.cancelled_orders || 0}</div>
                  <p className="text-sm text-gray-600">
                    Tỷ lệ hủy:{" "}
                    {Math.round(
                      ((stats?.orders.cancelled_orders || 0) / Math.max(stats?.orders.total_orders || 1, 1)) * 100,
                    )}
                    %
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thời gian giao hàng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Trung bình:</span>
                      <span className="font-semibold">
                        {Math.round(stats?.delivery_performance.avg_delivery_time || 0)} phút
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nhanh nhất:</span>
                      <span className="font-semibold text-green-600">
                        {stats?.delivery_performance.fastest_delivery || 0} phút
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chậm nhất:</span>
                      <span className="font-semibold text-red-600">
                        {stats?.delivery_performance.slowest_delivery || 0} phút
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hiệu suất tổng thể</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Tổng số giao hàng:</span>
                      <span className="font-semibold">{stats?.delivery_performance.total_deliveries || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Giao đúng giờ:</span>
                      <span className="font-semibold text-green-600">
                        {stats?.delivery_performance.on_time_deliveries || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hiệu suất thời gian:</span>
                      <span className="font-semibold">
                        {Math.round(stats?.delivery_performance.time_efficiency_percent || 0)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="traffic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">Báo cáo ngập nước</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.traffic_reports.flood_reports || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Báo cáo kẹt xe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.traffic_reports.traffic_reports || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Đã xác thực</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.traffic_reports.verified_reports || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-yellow-600">Tổng upvotes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.traffic_reports.total_upvotes || 0}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Phân tích chi tiết</span>
                </CardTitle>
                <CardDescription>Dữ liệu phân tích sâu về hoạt động giao hàng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Biểu đồ phân tích chi tiết</p>
                  <p className="text-sm">Tính năng này sẽ được phát triển trong phiên bản tiếp theo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
