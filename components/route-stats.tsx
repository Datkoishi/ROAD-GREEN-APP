"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Clock, MapPin, Car } from "lucide-react"

interface RouteStatsProps {
  routeData: any
  vehicle: string
}

export default function RouteStats({ routeData, vehicle }: RouteStatsProps) {
  if (!routeData || !routeData.paths || routeData.paths.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <span>Thống kê tuyến đường</span>
          </CardTitle>
          <CardDescription>Không có dữ liệu để hiển thị</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">Chưa có tuyến đường nào được chọn</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentRoute = routeData.paths[0] // Lấy tuyến đường đầu tiên

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000)
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (hours > 0) {
      return `${hours} giờ ${remainingMinutes} phút`
    }
    return `${minutes} phút`
  }

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`
    }
    return `${meters} m`
  }

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'car':
        return '🚗'
      case 'motorcycle':
        return '🏍️'
      case 'bike':
        return '🚲'
      case 'truck':
        return '🚛'
      default:
        return '🚗'
    }
  }

  // Tính toán thống kê
  const totalDistance = currentRoute.distance
  const totalTime = currentRoute.time
  const avgSpeed = totalDistance / (totalTime / 1000) * 3.6 // km/h
  const instructionCount = currentRoute.instructions?.length || 0

  // Phân tích loại hướng đi
  const directionStats = currentRoute.instructions?.reduce((acc: any, instruction: any) => {
    const sign = instruction.sign
    if (sign === 0) acc.continue++
    else if (sign > 0) acc.right++
    else if (sign < 0) acc.left++
    else if (sign === 4) acc.arrive++
    return acc
  }, { continue: 0, right: 0, left: 0, arrive: 0 }) || { continue: 0, right: 0, left: 0, arrive: 0 }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          <span>Thống kê tuyến đường</span>
        </CardTitle>
        <CardDescription>
          Phân tích chi tiết tuyến đường hiện tại
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tổng quan */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Tổng khoảng cách</p>
                <p className="font-semibold text-sm">{formatDistance(totalDistance)}</p>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Thời gian dự kiến</p>
                <p className="font-semibold text-sm">{formatTime(totalTime)}</p>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Tốc độ trung bình</p>
                <p className="font-semibold text-sm">{avgSpeed.toFixed(1)} km/h</p>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Car className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">Số bước đi</p>
                <p className="font-semibold text-sm">{instructionCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Phân tích hướng đi */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Phân tích hướng đi</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-gray-600">Đi thẳng:</span>
              <Badge variant="outline" className="text-xs">
                {directionStats.continue}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-gray-600">Rẽ phải:</span>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                {directionStats.right}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-gray-600">Rẽ trái:</span>
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                {directionStats.left}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-gray-600">Đến đích:</span>
              <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                {directionStats.arrive}
              </Badge>
            </div>
          </div>
        </div>

        {/* Biểu đồ đơn giản */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Tỷ lệ thời gian</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>Thời gian di chuyển</span>
              <span className="font-medium">{formatTime(totalTime)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: '100%' }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 text-center">
              Tuyến đường tối ưu với {instructionCount} bước đi
            </div>
          </div>
        </div>

        {/* Thông tin phương tiện */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{getVehicleIcon(vehicle)}</span>
              <div>
                <p className="text-sm font-medium">
                  {vehicle === 'car' ? 'Ô tô' : vehicle === 'motorcycle' ? 'Xe máy' : vehicle === 'bike' ? 'Xe đạp' : 'Xe tải'}
                </p>
                <p className="text-xs text-gray-500">Phương tiện được chọn</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {vehicle.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 