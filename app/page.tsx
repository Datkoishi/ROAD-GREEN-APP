"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Route, Users, AlertTriangle, Star, Truck } from "lucide-react"
import RouteOptimizer from "@/components/route-optimizer"
import CustomerManager from "@/components/customer-manager"
import TrafficReporter from "@/components/traffic-reporter"
import MapView from "@/components/map-view"
import VietMapRoute from "@/components/vietmap-route"
import VietMapMap from "@/components/vietmap-map"
import SecurityInfo from "@/components/security-info"

export default function Dashboard() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const [userScore, setUserScore] = useState(1250)

  const features = [
    {
      id: "route-optimizer",
      title: "Sắp xếp lộ trình",
      description: "Tối ưu hóa tuyến đường giao hàng cho nhiều đơn hàng",
      icon: Route,
      color: "bg-blue-500",
    },
    {
      id: "customer-manager",
      title: "Quản lý khách hàng",
      description: "Lưu trữ và quản lý thông tin khách hàng đã giao",
      icon: Users,
      color: "bg-green-500",
    },
    {
      id: "traffic-reporter",
      title: "Báo cáo giao thông",
      description: "Cảnh báo kẹt xe và ngập nước cho cộng đồng",
      icon: AlertTriangle,
      color: "bg-orange-500",
    },
  ]

  if (activeFeature) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => setActiveFeature(null)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ← Quay lại
                </Button>
                <div className="flex items-center space-x-2">
                  <Truck className="h-6 w-6 text-green-600" />
                  <h1 className="text-xl font-bold text-gray-900">Road Green</h1>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">{userScore} điểm</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeFeature === "route-optimizer" && <RouteOptimizer />}
          {activeFeature === "customer-manager" && <CustomerManager />}
          {activeFeature === "traffic-reporter" && (
            <TrafficReporter userScore={userScore} setUserScore={setUserScore} />
          )}
        </main>
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
                <h1 className="text-2xl font-bold text-gray-900">Road Green</h1>
                <p className="text-sm text-gray-600">Hệ thống tối ưu hóa giao hàng thông minh</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-500" />
                <span>{userScore} điểm</span>
              </Badge>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Tài xế</p>
                <p className="text-xs text-gray-600">Đang hoạt động</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Chọn tính năng</h2>
          <p className="text-gray-600">Lựa chọn tính năng bạn muốn sử dụng để tối ưu hóa việc giao hàng</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature) => {
            const IconComponent = feature.icon
            return (
              <Card
                key={feature.id}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-green-200"
                onClick={() => setActiveFeature(feature.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${feature.color}`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <VietMapMap />
          <VietMapRoute />
        </div>
        
        <div className="mt-8 space-y-6">
          <SecurityInfo />
          
          <Card>
            <CardHeader>
              <CardTitle>Thống kê hôm nay</CardTitle>
              <CardDescription>Tổng quan hoạt động giao hàng của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Đơn hàng đã giao</span>
                <span className="font-semibold">12 đơn</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Quãng đường</span>
                <span className="font-semibold">45.2 km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Thời gian giao hàng</span>
                <span className="font-semibold">6.5 giờ</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Báo cáo giao thông</span>
                <span className="font-semibold text-green-600">+50 điểm</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
