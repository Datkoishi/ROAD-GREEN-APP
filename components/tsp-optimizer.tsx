"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Route, 
  Loader2, 
  Plus, 
  Trash2, 
  Navigation, 
  Clock, 
  Car,
  Zap,
  Target,
  CheckCircle,
  AlertCircle
} from "lucide-react"

interface TSPPoint {
  id: string
  name: string
  lat: string
  lng: string
  address?: string
}

interface TSPResponse {
  license: string
  code: string
  messages: any
  paths: Array<{
    distance: number
    weight: number
    time: number
    transfers: number
    points_encoded: boolean
    bbox: number[]
    points: string
    instructions: Array<{
      distance: number
      heading: number
      sign: number
      interval: number[]
      text: string
      time: number
      street_name: string
      last_heading: number | null
    }>
    snapped_waypoints: string
  }>
  tsp_info?: {
    total_points: number
    vehicle: string
    roundtrip: boolean
    sources: string
    destinations: string
  }
}

export default function TSPOptimizer() {
  const [points, setPoints] = useState<TSPPoint[]>([
    { id: '1', name: 'Điểm xuất phát', lat: '10.7729', lng: '106.6984', address: 'Bến Thành, Quận 1, TP.HCM' },
    { id: '2', name: 'Điểm dừng 1', lat: '10.7884', lng: '106.7056', address: 'Võ Thị Sáu, Quận 3, TP.HCM' },
    { id: '3', name: 'Điểm dừng 2', lat: '10.7379', lng: '106.7017', address: 'Phú Mỹ Hưng, Quận 7, TP.HCM' }
  ])
  const [vehicle, setVehicle] = useState('car')
  const [roundtrip, setRoundtrip] = useState(true)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TSPResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const addPoint = () => {
    const newId = (points.length + 1).toString()
    setPoints([...points, {
      id: newId,
      name: `Điểm dừng ${points.length}`,
      lat: '',
      lng: '',
      address: ''
    }])
  }

  const removePoint = (id: string) => {
    if (points.length <= 2) {
      setError('Cần ít nhất 2 điểm để tối ưu hóa tuyến đường')
      return
    }
    setPoints(points.filter(point => point.id !== id))
  }

  const updatePoint = (id: string, field: keyof TSPPoint, value: string) => {
    setPoints(points.map(point => 
      point.id === id ? { ...point, [field]: value } : point
    ))
  }

  const optimizeRoute = async () => {
    // Validate points
    const validPoints = points.filter(point => point.lat && point.lng)
    if (validPoints.length < 2) {
      setError('Cần ít nhất 2 điểm hợp lệ để tối ưu hóa')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const pointParams = validPoints.map(point => `${point.lat},${point.lng}`)
      const url = `/api/map/tsp?${pointParams.map(point => `point=${encodeURIComponent(point)}`).join('&')}&vehicle=${vehicle}&roundtrip=${roundtrip}`

      const response = await fetch(url)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Lỗi khi tối ưu hóa tuyến đường')
      }

      setResult(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
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

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'car': return '🚗'
      case 'motorcycle': return '🏍️'
      case 'bike': return '🚲'
      case 'foot': return '🚶'
      default: return '🚗'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border-b border-gray-200/50">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <div className="p-2 bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-700 rounded-lg shadow-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent font-bold">
              TSP - Tối ưu hóa tuyến đường đa điểm
            </span>
          </CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Traveling Salesman Problem - Tìm tuyến đường ngắn nhất đi qua tất cả điểm chỉ một lần
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Phương tiện</Label>
              <Select value={vehicle} onValueChange={setVehicle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">🚗 Ô tô</SelectItem>
                  <SelectItem value="motorcycle">🏍️ Xe máy</SelectItem>
                  <SelectItem value="bike">🚲 Xe đạp</SelectItem>
                  <SelectItem value="foot">🚶 Đi bộ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Loại tuyến</Label>
              <Select value={roundtrip ? 'true' : 'false'} onValueChange={(value) => setRoundtrip(value === 'true')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">🔄 Khứ hồi (Roundtrip)</SelectItem>
                  <SelectItem value="false">➡️ Một chiều</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Số điểm</Label>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {points.length}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addPoint}
                  disabled={points.length >= 20}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm điểm
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Points Management */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span>Quản lý điểm dừng</span>
          </CardTitle>
          <CardDescription>
            Thêm, sửa hoặc xóa các điểm dừng trong tuyến đường
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {points.map((point, index) => (
            <div key={point.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs text-gray-600">Tên điểm</Label>
                  <Input
                    value={point.name}
                    onChange={(e) => updatePoint(point.id, 'name', e.target.value)}
                    placeholder="Tên điểm dừng"
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <Label className="text-xs text-gray-600">Vĩ độ</Label>
                  <Input
                    value={point.lat}
                    onChange={(e) => updatePoint(point.id, 'lat', e.target.value)}
                    placeholder="10.7729"
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <Label className="text-xs text-gray-600">Kinh độ</Label>
                  <Input
                    value={point.lng}
                    onChange={(e) => updatePoint(point.id, 'lng', e.target.value)}
                    placeholder="106.6984"
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <Label className="text-xs text-gray-600">Địa chỉ</Label>
                  <Input
                    value={point.address || ''}
                    onChange={(e) => updatePoint(point.id, 'address', e.target.value)}
                    placeholder="Địa chỉ (tùy chọn)"
                    className="text-sm"
                  />
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => removePoint(point.id)}
                disabled={points.length <= 2}
                className="flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Optimize Button */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <Button
            onClick={optimizeRoute}
            disabled={loading || points.filter(p => p.lat && p.lng).length < 2}
            className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Đang tối ưu hóa tuyến đường...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Tối ưu hóa tuyến đường TSP</span>
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-b border-gray-200/50">
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Kết quả tối ưu hóa TSP</span>
            </CardTitle>
            <CardDescription>
              Tuyến đường ngắn nhất đi qua {result.tsp_info?.total_points} điểm
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Route Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Navigation className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tổng khoảng cách</p>
                    <p className="font-semibold text-lg">{formatDistance(result.paths[0].distance)}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Thời gian dự kiến</p>
                    <p className="font-semibold text-lg">{formatTime(result.paths[0].time)}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Car className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Phương tiện</p>
                    <p className="font-semibold text-lg">{getVehicleIcon(vehicle)} {vehicle}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Số điểm</p>
                    <p className="font-semibold text-lg">{result.tsp_info?.total_points}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* TSP Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Thông tin TSP</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Loại tuyến:</span>
                  <Badge variant="outline" className="ml-2">
                    {result.tsp_info?.roundtrip ? '🔄 Khứ hồi' : '➡️ Một chiều'}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">Điểm xuất phát:</span>
                  <span className="ml-2 font-medium">{result.tsp_info?.sources}</span>
                </div>
                <div>
                  <span className="text-gray-600">Điểm kết thúc:</span>
                  <span className="ml-2 font-medium">{result.tsp_info?.destinations}</span>
                </div>
                <div>
                  <span className="text-gray-600">API:</span>
                  <Badge variant="outline" className="ml-2 bg-green-100 text-green-700">
                    {result.license}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Instructions */}
            {result.paths[0].instructions && (
              <div>
                <h4 className="font-semibold mb-3">Hướng dẫn tuyến đường tối ưu</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {result.paths[0].instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{instruction.text}</p>
                        {instruction.street_name && (
                          <p className="text-xs text-gray-600 mt-1">{instruction.street_name}</p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>{formatDistance(instruction.distance)}</span>
                          <span>{formatTime(instruction.time)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 