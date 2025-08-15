"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, Loader2, Plus, X, AlertCircle } from "lucide-react"

interface Vehicle {
  id: string
  start: string
  end: string
}

interface DeliveryPoint {
  id: string
  location: string
}

interface VRPResult {
  vehicles: any[]
  total_distance: number
  total_time: number
  routes: any[]
}

export default function VRPFeature() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: "vehicle1", start: "10.7729,106.6984", end: "10.7729,106.6984" }
  ])
  const [points, setPoints] = useState<DeliveryPoint[]>([
    { id: "point1", location: "10.7884,106.7056" },
    { id: "point2", location: "10.7379,106.7017" }
  ])
  const [vehicle, setVehicle] = useState("car")
  const [result, setResult] = useState<VRPResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addVehicle = () => {
    if (vehicles.length < 10) {
      const newId = `vehicle${vehicles.length + 1}`
      setVehicles([...vehicles, { id: newId, start: "10.7729,106.6984", end: "10.7729,106.6984" }])
    }
  }

  const removeVehicle = (index: number) => {
    if (vehicles.length > 1) {
      setVehicles(vehicles.filter((_, i) => i !== index))
    }
  }

  const updateVehicle = (index: number, field: keyof Vehicle, value: string) => {
    const newVehicles = [...vehicles]
    newVehicles[index] = { ...newVehicles[index], [field]: value }
    setVehicles(newVehicles)
  }

  const addPoint = () => {
    if (points.length < 50) {
      const newId = `point${points.length + 1}`
      setPoints([...points, { id: newId, location: "10.7884,106.7056" }])
    }
  }

  const removePoint = (index: number) => {
    if (points.length > 1) {
      setPoints(points.filter((_, i) => i !== index))
    }
  }

  const updatePoint = (index: number, field: keyof DeliveryPoint, value: string) => {
    const newPoints = [...points]
    newPoints[index] = { ...newPoints[index], [field]: value }
    setPoints(newPoints)
  }

  const handleOptimize = async () => {
    if (vehicles.length < 1 || points.length < 2) {
      setError("Cần ít nhất 1 phương tiện và 2 điểm giao hàng")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/map/vrp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicles,
          points,
          vehicle,
          format: 'json'
        })
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || "Lỗi khi tối ưu hóa VRP")
      }
    } catch (err) {
      setError("Lỗi kết nối mạng")
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
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

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-6">
        {/* Vehicles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Phương tiện (1-10 xe)</Label>
            {vehicles.length < 10 && (
              <Button variant="outline" size="sm" onClick={addVehicle}>
                <Plus className="h-4 w-4 mr-1" />
                Thêm xe
              </Button>
            )}
          </div>
          
          <div className="space-y-3">
            {vehicles.map((vehicle, index) => (
              <Card key={index} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Xe {index + 1}</h4>
                      {vehicles.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVehicle(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Điểm xuất phát</Label>
                        <Input
                          value={vehicle.start}
                          onChange={(e) => updateVehicle(index, 'start', e.target.value)}
                          placeholder="lat,lng"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Điểm kết thúc</Label>
                        <Input
                          value={vehicle.end}
                          onChange={(e) => updateVehicle(index, 'end', e.target.value)}
                          placeholder="lat,lng"
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Delivery Points */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Điểm giao hàng (2-50 điểm)</Label>
            {points.length < 50 && (
              <Button variant="outline" size="sm" onClick={addPoint}>
                <Plus className="h-4 w-4 mr-1" />
                Thêm điểm
              </Button>
            )}
          </div>
          
          <div className="space-y-3">
            {points.map((point, index) => (
              <Card key={index} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Điểm {index + 1}</h4>
                      {points.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePoint(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-xs">Tọa độ</Label>
                      <Input
                        value={point.location}
                        onChange={(e) => updatePoint(index, 'location', e.target.value)}
                        placeholder="lat,lng"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">Loại phương tiện</Label>
          <div className="flex space-x-2">
            {['car', 'motorcycle', 'bike', 'truck'].map((v) => (
              <Button
                key={v}
                variant={vehicle === v ? "default" : "outline"}
                size="sm"
                onClick={() => setVehicle(v)}
              >
                {v === 'car' ? '🚗 Ô tô' : 
                 v === 'motorcycle' ? '🏍️ Xe máy' : 
                 v === 'bike' ? '🚲 Xe đạp' : '🚛 Xe tải'}
              </Button>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleOptimize} 
          disabled={loading || vehicles.length < 1 || points.length < 2}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Car className="h-4 w-4" />
          )}
          Tối ưu hóa tuyến đường VRP
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Kết quả tối ưu hóa VRP</h3>
            <Badge variant="outline" className="bg-red-50 text-red-700">
              VRP API
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-800 mb-3">Tổng quan</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tổng khoảng cách:</span>
                    <span className="font-semibold">{formatDistance(result.total_distance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tổng thời gian:</span>
                    <span className="font-semibold">{formatTime(result.total_time)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Số xe:</span>
                    <span className="font-semibold">{result.vehicles.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-green-800 mb-3">Thống kê xe</h4>
                <div className="space-y-1">
                  {result.vehicles.map((vehicle, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>Xe {index + 1}:</span>
                      <span>{formatDistance(vehicle.distance)} • {formatTime(vehicle.time)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-purple-800 mb-3">Tuyến đường</h4>
                <div className="space-y-1">
                  {result.routes.map((route, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium">Xe {index + 1}:</div>
                      <div className="text-xs text-gray-600 ml-2">
                        {route.points.length} điểm giao hàng
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* API Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-800">Thông tin API</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• <strong>Endpoint:</strong> POST /api/map/vrp</p>
              <p>• <strong>Rate Limit:</strong> 20 requests/minute</p>
              <p>• <strong>Parameters:</strong> vehicles, points, vehicle, format</p>
              <p>• <strong>Limits:</strong> 1-10 xe, 2-50 điểm</p>
              <p>• <strong>Algorithm:</strong> Vehicle Routing Problem</p>
              <p>• <strong>Response:</strong> Tuyến đường tối ưu cho nhiều xe</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 