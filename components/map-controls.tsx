"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Navigation, Search, Route, Settings } from "lucide-react"

interface MapControlsProps {
  onRouteChange: (point1: string, point2: string, vehicle: string) => void
  loading?: boolean
  compact?: boolean
}

export default function MapControls({ onRouteChange, loading = false, compact = false }: MapControlsProps) {
  const [point1, setPoint1] = useState("10.7729,106.6984")
  const [point2, setPoint2] = useState("10.7884,106.7056")
  const [vehicle, setVehicle] = useState("car")

  const handleSearch = () => {
    // Validate coordinates before searching
    const coords1 = point1.split(',')
    const coords2 = point2.split(',')
    
    if (coords1.length === 2 && coords2.length === 2) {
      const lat1 = parseFloat(coords1[0])
      const lng1 = parseFloat(coords1[1])
      const lat2 = parseFloat(coords2[0])
      const lng2 = parseFloat(coords2[1])
      
      if (!isNaN(lat1) && !isNaN(lng1) && !isNaN(lat2) && !isNaN(lng2)) {
    onRouteChange(point1, point2, vehicle)
      } else {
        alert('Vui lòng nhập tọa độ hợp lệ (ví dụ: 10.7729,106.6984)')
      }
    } else {
      alert('Vui lòng nhập tọa độ đúng định dạng (lat,lng)')
    }
  }

  const presetRoutes = [
    {
      name: "Quận 1 → Quận 3",
      point1: "10.7729,106.6984",
      point2: "10.7884,106.7056"
    },
    {
      name: "Quận 7 → Quận 1",
      point1: "10.7379,106.7017",
      point2: "10.7729,106.6984"
    },
    {
      name: "Quận 9 → Quận 2",
      point1: "10.8411,106.8098",
      point2: "10.7872,106.7498"
    }
  ]

  const handlePresetRoute = (route: typeof presetRoutes[0]) => {
    setPoint1(route.point1)
    setPoint2(route.point2)
    onRouteChange(route.point1, route.point2, vehicle)
  }

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Point 1 */}
        <div className="space-y-2">
          <Label htmlFor="point1" className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-green-600" />
            <span>Điểm xuất phát</span>
          </Label>
          <Input
            id="point1"
            value={point1}
            onChange={(e) => setPoint1(e.target.value)}
            placeholder="10.7729,106.6984"
            className="font-mono text-sm"
          />
        </div>

        {/* Point 2 */}
        <div className="space-y-2">
          <Label htmlFor="point2" className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-red-600" />
            <span>Điểm đến</span>
          </Label>
          <Input
            id="point2"
            value={point2}
            onChange={(e) => setPoint2(e.target.value)}
            placeholder="10.7884,106.7056"
            className="font-mono text-sm"
          />
        </div>

        {/* Vehicle Type */}
        <div className="space-y-2">
          <Label htmlFor="vehicle" className="text-sm">Loại phương tiện</Label>
          <Select value={vehicle} onValueChange={setVehicle}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn phương tiện" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="car">🚗 Ô tô</SelectItem>
              <SelectItem value="motorcycle">🏍️ Xe máy</SelectItem>
              <SelectItem value="bike">🚲 Xe đạp</SelectItem>
              <SelectItem value="truck">🚛 Xe tải</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <Button 
          onClick={handleSearch} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Đang tìm tuyến đường...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Route className="h-4 w-4" />
              <span>Tìm tuyến đường</span>
            </div>
          )}
        </Button>

        {/* Preset Routes */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tuyến đường mẫu</Label>
          <div className="grid grid-cols-1 gap-2">
            {presetRoutes.map((route, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handlePresetRoute(route)}
                disabled={loading}
                className="justify-start text-left h-auto py-2"
              >
                <MapPin className="h-3 w-3 mr-2" />
                <span className="text-xs">{route.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-blue-600" />
          <span>Điều khiển tuyến đường</span>
        </CardTitle>
        <CardDescription>
          Nhập điểm xuất phát và điểm đến để tìm tuyến đường tối ưu
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Point 1 */}
        <div className="space-y-2">
          <Label htmlFor="point1" className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-green-600" />
            <span>Điểm xuất phát (lat,lng)</span>
          </Label>
          <Input
            id="point1"
            value={point1}
            onChange={(e) => setPoint1(e.target.value)}
            placeholder="10.7729,106.6984"
            className="font-mono text-sm"
          />
        </div>

        {/* Point 2 */}
        <div className="space-y-2">
          <Label htmlFor="point2" className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-red-600" />
            <span>Điểm đến (lat,lng)</span>
          </Label>
          <Input
            id="point2"
            value={point2}
            onChange={(e) => setPoint2(e.target.value)}
            placeholder="10.7884,106.7056"
            className="font-mono text-sm"
          />
        </div>

        {/* Vehicle Type */}
        <div className="space-y-2">
          <Label htmlFor="vehicle">Loại phương tiện</Label>
          <Select value={vehicle} onValueChange={setVehicle}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn phương tiện" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="car">🚗 Ô tô</SelectItem>
              <SelectItem value="motorcycle">🏍️ Xe máy</SelectItem>
              <SelectItem value="bike">🚲 Xe đạp</SelectItem>
              <SelectItem value="truck">🚛 Xe tải</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <Button 
          onClick={handleSearch} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Đang tìm tuyến đường...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Route className="h-4 w-4" />
              <span>Tìm tuyến đường</span>
            </div>
          )}
        </Button>

        {/* Preset Routes */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tuyến đường mẫu</Label>
          <div className="grid grid-cols-1 gap-2">
            {presetRoutes.map((route, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handlePresetRoute(route)}
                disabled={loading}
                className="justify-start text-left"
              >
                <MapPin className="h-3 w-3 mr-2" />
                {route.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Hướng dẫn:</strong></p>
          <p>• Nhập tọa độ theo định dạng: lat,lng</p>
          <p>• Ví dụ: 10.7729,106.6984</p>
          <p>• Hoặc chọn tuyến đường mẫu có sẵn</p>
        </div>
      </CardContent>
    </Card>
  )
} 