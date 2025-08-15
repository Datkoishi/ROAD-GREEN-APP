"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Clock, Car, Route, ChevronRight, ChevronDown } from "lucide-react"

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

interface RouteDetailsProps {
  routeData: {
    license: string
    code: string
    messages: any
    paths: RoutePath[]
  } | null
  selectedRoute: number
  onRouteChange: (index: number) => void
  vehicle: string
}

export default function RouteDetails({ routeData, selectedRoute, onRouteChange, vehicle }: RouteDetailsProps) {
  const [expandedInstructions, setExpandedInstructions] = useState(false)

  if (!routeData || !routeData.paths || routeData.paths.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Route className="h-5 w-5 text-blue-600" />
            <span>Chi tiết tuyến đường</span>
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
      case 0: return "→" // Continue
      case 1: return "↗" // Slight right
      case 2: return "→" // Right
      case 3: return "↘" // Sharp right
      case -1: return "↖" // Slight left
      case -2: return "←" // Left
      case -3: return "↙" // Sharp left
      case 4: return "●" // Arrive
      case 5: return "↺" // U-turn
      case 6: return "↻" // U-turn right
      default: return "→"
    }
  }

  const getDirectionColor = (sign: number) => {
    switch (sign) {
      case 0: return "text-blue-600" // Continue
      case 1: case 2: case 3: return "text-green-600" // Right turns
      case -1: case -2: case -3: return "text-orange-600" // Left turns
      case 4: return "text-red-600" // Arrive
      case 5: case 6: return "text-purple-600" // U-turn
      default: return "text-gray-600"
    }
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Route className="h-5 w-5 text-blue-600" />
          <span>Chi tiết tuyến đường</span>
        </CardTitle>
        <CardDescription>
          Hướng dẫn từng bước đi chi tiết
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
                onClick={() => onRouteChange(index)}
              >
                Tuyến {index + 1}
              </button>
            ))}
          </div>
        )}

        {/* Route Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
            <Navigation className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs text-gray-600">Tổng khoảng cách</p>
              <p className="font-semibold text-sm">{formatDistance(currentRoute.distance)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
            <Clock className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-xs text-gray-600">Thời gian dự kiến</p>
              <p className="font-semibold text-sm">{formatTime(currentRoute.time)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
            <Car className="h-4 w-4 text-orange-600" />
            <div>
              <p className="text-xs text-gray-600">Phương tiện</p>
              <p className="font-semibold text-sm">{getVehicleIcon(vehicle)} {vehicle === 'car' ? 'Ô tô' : vehicle === 'motorcycle' ? 'Xe máy' : vehicle === 'bike' ? 'Xe đạp' : 'Xe tải'}</p>
            </div>
          </div>
        </div>

        {/* Route Instructions */}
        {currentRoute.instructions && currentRoute.instructions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700">
                Hướng dẫn chi tiết ({currentRoute.instructions.length} bước)
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedInstructions(!expandedInstructions)}
                className="text-xs"
              >
                {expandedInstructions ? (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Thu gọn
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-3 w-3 mr-1" />
                    Mở rộng
                  </>
                )}
              </Button>
            </div>
            
            <div className={`space-y-2 ${expandedInstructions ? 'max-h-96' : 'max-h-64'} overflow-y-auto`}>
              {currentRoute.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  {/* Step Number */}
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  
                  {/* Direction Icon */}
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-lg font-bold ${getDirectionColor(instruction.sign)}`}>
                    {getDirectionIcon(instruction.sign)}
                  </div>
                  
                  {/* Instruction Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {instruction.text}
                    </p>
                    {instruction.street_name && (
                      <p className="text-xs text-gray-600 mb-1">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {instruction.street_name}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Navigation className="h-3 w-3 mr-1" />
                        {formatDistance(instruction.distance)}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(instruction.time)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Route Statistics */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Thống kê tuyến đường</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Tổng khoảng cách:</span>
              <span className="font-medium">{formatDistance(currentRoute.distance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Thời gian dự kiến:</span>
              <span className="font-medium">{formatTime(currentRoute.time)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Số bước đi:</span>
              <span className="font-medium">{currentRoute.instructions?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Loại phương tiện:</span>
              <span className="font-medium">{getVehicleIcon(vehicle)} {vehicle}</span>
            </div>
          </div>
        </div>


      </CardContent>
    </Card>
  )
} 