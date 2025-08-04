"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Navigation, Car, Route } from "lucide-react"

interface RouteInstruction {
  distance: number
  heading: number
  sign: number
  interval: number[]
  text: string
  time: number
  street_name: string
  last_heading: number | null
}

interface RoutePath {
  distance: number
  weight: number
  time: number
  transfers: number
  points_encoded: boolean
  bbox: number[]
  points: string
  instructions: RouteInstruction[]
  snapped_waypoints: string
}

interface VietMapResponse {
  license: string
  code: string
  messages: any
  paths: RoutePath[]
}

export default function VietMapRoute() {
  const [routeData, setRouteData] = useState<VietMapResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRoute, setSelectedRoute] = useState(0)

  useEffect(() => {
    fetchRouteData()
  }, [])

  const fetchRouteData = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        "/api/vietmap?point1=10.7729,106.6984&point2=10.7884,106.7056&vehicle=car"
      )
      
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu tuyến đường")
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || "Lỗi từ VietMap API")
      }
      
      setRouteData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định")
    } finally {
      setLoading(false)
    }
  }

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

  const getDirectionIcon = (sign: number) => {
    switch (sign) {
      case 0: return "→" // tiếp tục
      case 2: return "↱" // rẽ phải
      case -2: return "↰" // rẽ trái
      case 4: return "●" // đến đích
      case -8: return "↱" // rẽ phải nhẹ
      default: return "→"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Route className="h-5 w-5 text-blue-600" />
            <span>Tuyến đường VietMap</span>
          </CardTitle>
          <CardDescription>Đang tải thông tin tuyến đường...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Route className="h-5 w-5 text-red-600" />
            <span>Tuyến đường VietMap</span>
          </CardTitle>
          <CardDescription>Lỗi khi tải dữ liệu</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchRouteData} variant="outline">
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!routeData || !routeData.paths || routeData.paths.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Route className="h-5 w-5 text-gray-600" />
            <span>Tuyến đường VietMap</span>
          </CardTitle>
          <CardDescription>Không có dữ liệu tuyến đường</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">Không tìm thấy tuyến đường phù hợp</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentRoute = routeData.paths[selectedRoute]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Route className="h-5 w-5 text-blue-600" />
          <span>Tuyến đường VietMap</span>
        </CardTitle>
        <CardDescription>
          Từ: 10.7729, 106.6984 → Đến: 10.7884, 106.7056
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Route Selection */}
        {routeData.paths.length > 1 && (
          <div className="flex space-x-2">
            {routeData.paths.map((path, index) => (
              <Button
                key={index}
                variant={selectedRoute === index ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRoute(index)}
              >
                Tuyến {index + 1}
              </Button>
            ))}
          </div>
        )}

        {/* Route Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <Navigation className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Khoảng cách</p>
              <p className="font-semibold">{formatDistance(currentRoute.distance)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <Clock className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Thời gian</p>
              <p className="font-semibold">{formatTime(currentRoute.time)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
            <Car className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Phương tiện</p>
              <p className="font-semibold">Ô tô</p>
            </div>
          </div>
        </div>

        {/* Route Instructions */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>Hướng dẫn đường đi</span>
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {currentRoute.instructions.map((instruction, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{getDirectionIcon(instruction.sign)}</span>
                    <span className="font-medium">{instruction.text}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{instruction.street_name}</span>
                    <div className="flex items-center space-x-4">
                      <span>{formatDistance(instruction.distance)}</span>
                      <span>{formatTime(instruction.time)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Info */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Dữ liệu từ VietMap API</span>
            <Badge variant="outline" className="text-xs">
              {routeData.license}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 