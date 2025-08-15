"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Clock, 
  Truck, 
  Star, 
  Users, 
  Route,
  AlertTriangle,
  CheckCircle,
  Activity
} from "lucide-react"

interface DashboardStatsProps {
  userScore: number
}

export default function EnhancedDashboard({ userScore }: DashboardStatsProps) {
  const stats = [
    {
      title: "Đơn hàng hôm nay",
      value: "12",
      change: "+2",
      changeType: "positive",
      icon: Truck,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "So với hôm qua"
    },
    {
      title: "Quãng đường",
      value: "45.2 km",
      change: "+8.5 km",
      changeType: "positive",
      icon: MapPin,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Tổng cộng"
    },
    {
      title: "Thời gian giao",
      value: "6.5h",
      change: "-0.5h",
      changeType: "positive",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Hiệu quả hơn"
    },
    {
      title: "Điểm tích lũy",
      value: userScore.toString(),
      change: "+50",
      changeType: "positive",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      description: "Tháng này"
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: "delivery",
      title: "Giao hàng thành công",
      description: "Đơn hàng #12345 - Quận 1 → Quận 3",
      time: "2 phút trước",
      status: "success"
    },
    {
      id: 2,
      type: "traffic",
      title: "Báo cáo giao thông",
      description: "Kẹt xe tại Nguyễn Huệ, Quận 1",
      time: "15 phút trước",
      status: "warning"
    },
    {
      id: 3,
      type: "route",
      title: "Tuyến đường tối ưu",
      description: "Tìm thấy tuyến đường ngắn hơn 2.3km",
      time: "1 giờ trước",
      status: "info"
    },
    {
      id: 4,
      type: "customer",
      title: "Khách hàng mới",
      description: "Thêm khách hàng tại Quận 7",
      time: "2 giờ trước",
      status: "success"
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "delivery":
        return <Truck className="h-4 w-4" />
      case "traffic":
        return <AlertTriangle className="h-4 w-4" />
      case "route":
        return <Route className="h-4 w-4" />
      case "customer":
        return <Users className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50"
      case "warning":
        return "text-orange-600 bg-orange-50"
      case "info":
        return "text-blue-600 bg-blue-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <Card key={index} className="hover:shadow-md transition-all duration-200 border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <div className="flex items-center space-x-2">
                      {stat.changeType === 'positive' ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className={`text-xs font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                    </span>
                      <span className="text-xs text-gray-500">{stat.description}</span>
        </div>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                </CardContent>
              </Card>
          )
        })}
            </div>

      {/* Recent Activities */}
      <Card className="border-0 shadow-sm">
                <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-purple-600" />
            <span>Hoạt động gần đây</span>
          </CardTitle>
          <CardDescription>
            Cập nhật mới nhất về hoạt động giao hàng
          </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                  {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        </div>
                <div className="flex-shrink-0">
                  {activity.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {activity.status === 'warning' && (
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  )}
                  {activity.status === 'info' && (
                    <Route className="h-4 w-4 text-blue-600" />
                        )}
                </div>
                      </div>
                    ))}
                  </div>
          
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full">
              Xem tất cả hoạt động
            </Button>
          </div>
                </CardContent>
              </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
                <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Hiệu suất tháng</span>
            </CardTitle>
            <CardDescription>
              So sánh với tháng trước
            </CardDescription>
                </CardHeader>
          <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tỷ lệ giao hàng thành công</span>
                      <div className="flex items-center space-x-2">
                <span className="font-semibold text-green-600">98.5%</span>
                <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '98.5%' }}></div>
                    </div>

                    <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Thời gian giao trung bình</span>
                      <div className="flex items-center space-x-2">
                <span className="font-semibold text-blue-600">32 phút</span>
                <TrendingDown className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Đánh giá khách hàng</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-yellow-600">4.8/5</span>
                <Star className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </CardContent>
              </Card>

        <Card className="border-0 shadow-sm">
                <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <span>Khu vực hoạt động</span>
            </CardTitle>
            <CardDescription>
              Các quận đã giao hàng hôm nay
            </CardDescription>
                </CardHeader>
                <CardContent>
            <div className="space-y-3">
              {[
                { district: "Quận 1", orders: 4, color: "bg-blue-500" },
                { district: "Quận 3", orders: 3, color: "bg-green-500" },
                { district: "Quận 7", orders: 2, color: "bg-purple-500" },
                { district: "Quận 2", orders: 2, color: "bg-orange-500" },
                { district: "Quận 9", orders: 1, color: "bg-red-500" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm font-medium">{item.district}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {item.orders} đơn
                  </Badge>
                    </div>
              ))}
                    </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tổng cộng:</span>
                <span className="font-semibold">12 đơn hàng</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
    </div>
  )
}
