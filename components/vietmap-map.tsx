"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Clock, Car } from "lucide-react"

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

export default function VietMapMap() {
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-green-600" />
            <span>Bản đồ tuyến đường</span>
          </CardTitle>
          <CardDescription>Đang tải bản đồ...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
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
            <MapPin className="h-5 w-5 text-red-600" />
            <span>Bản đồ tuyến đường</span>
          </CardTitle>
          <CardDescription>Lỗi khi tải bản đồ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchRouteData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Thử lại
            </button>
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
            <MapPin className="h-5 w-5 text-gray-600" />
            <span>Bản đồ tuyến đường</span>
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
          <MapPin className="h-5 w-5 text-green-600" />
          <span>Bản đồ tuyến đường</span>
        </CardTitle>
        <CardDescription>
          Từ: 10.7729, 106.6984 → Đến: 10.7884, 106.7056
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Route Selection */}
        {routeData.paths.length > 1 && (
          <div className="flex space-x-2">
            {routeData.paths.map((path, index) => (
              <button
                key={index}
                className={`px-3 py-1 rounded text-sm ${
                  selectedRoute === index 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setSelectedRoute(index)}
              >
                Tuyến {index + 1}
              </button>
            ))}
          </div>
        )}

        {/* Map Visualization */}
        <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
          {/* Simple map representation */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
            {/* Start point */}
            <div className="absolute top-4 left-4 w-3 h-3 bg-green-600 rounded-full border-2 border-white shadow-lg"></div>
            <div className="absolute top-6 left-8 text-xs font-medium text-gray-700">Điểm xuất phát</div>
            
            {/* End point */}
            <div className="absolute bottom-4 right-4 w-3 h-3 bg-red-600 rounded-full border-2 border-white shadow-lg"></div>
            <div className="absolute bottom-6 right-8 text-xs font-medium text-gray-700">Điểm đến</div>
            
            {/* Route line */}
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
              <path
                d="M 16 16 Q 128 64 240 240"
                stroke="#3B82F6"
                strokeWidth="3"
                fill="none"
                strokeDasharray="5,5"
                opacity="0.8"
              />
            </svg>
            
            {/* Route info overlay */}
            <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 rounded p-2 text-xs">
              <div className="flex items-center space-x-2">
                <Navigation className="h-3 w-3 text-blue-600" />
                <span>{formatDistance(currentRoute.distance)}</span>
                <Clock className="h-3 w-3 text-green-600" />
                <span>{formatTime(currentRoute.time)}</span>
                <Car className="h-3 w-3 text-orange-600" />
                <span>Ô tô</span>
              </div>
            </div>
          </div>
        </div>

        {/* Route Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
            <Navigation className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs text-gray-600">Khoảng cách</p>
              <p className="font-semibold text-sm">{formatDistance(currentRoute.distance)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
            <Clock className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-xs text-gray-600">Thời gian</p>
              <p className="font-semibold text-sm">{formatTime(currentRoute.time)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
            <Car className="h-4 w-4 text-orange-600" />
            <div>
              <p className="text-xs text-gray-600">Phương tiện</p>
              <p className="font-semibold text-sm">Ô tô</p>
            </div>
          </div>
        </div>

        {/* API Info */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-gray-500">
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