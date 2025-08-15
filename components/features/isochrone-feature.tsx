"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Loader2, AlertCircle } from "lucide-react"

interface IsochroneResult {
  features: any[]
  type: string
}

export default function IsochroneFeature() {
  const [latitude, setLatitude] = useState("10.7729")
  const [longitude, setLongitude] = useState("106.6984")
  const [time, setTime] = useState("600") // 10 minutes default
  const [vehicle, setVehicle] = useState("car")
  const [result, setResult] = useState<IsochroneResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = async () => {
    if (!latitude.trim() || !longitude.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/map/isochrone?lat=${latitude}&lng=${longitude}&time=${time}&vehicle=${vehicle}`)
      const data = await response.json()

      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || "Lỗi khi tính toán isochrone")
      }
    } catch (err) {
      setError("Lỗi kết nối mạng")
    } finally {
      setLoading(false)
    }
  }

  const presetLocations = [
    { lat: "10.7729", lng: "106.6984", name: "Bến Thành", time: "600" },
    { lat: "10.7884", lng: "106.7056", name: "Quận 3", time: "900" },
    { lat: "10.7379", lng: "106.7017", name: "Quận 7", time: "1200" },
    { lat: "10.7872", lng: "106.7498", name: "Quận 2", time: "1800" }
  ]

  const timeOptions = [
    { value: "300", label: "5 phút" },
    { value: "600", label: "10 phút" },
    { value: "900", label: "15 phút" },
    { value: "1200", label: "20 phút" },
    { value: "1800", label: "30 phút" },
    { value: "3600", label: "60 phút" }
  ]

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude" className="text-sm font-semibold">
              Latitude (Vĩ độ)
            </Label>
            <Input
              id="latitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="10.7729"
              type="number"
              step="any"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude" className="text-sm font-semibold">
              Longitude (Kinh độ)
            </Label>
            <Input
              id="longitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="106.6984"
              type="number"
              step="any"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">Thời gian tối đa</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {timeOptions.map((option) => (
              <Button
                key={option.value}
                variant={time === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setTime(option.value)}
                className="text-xs"
              >
                {option.label}
              </Button>
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
          onClick={handleCalculate} 
          disabled={loading || !latitude.trim() || !longitude.trim()}
          className="w-full bg-teal-600 hover:bg-teal-700"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Target className="h-4 w-4" />
          )}
          Tính toán vùng tiếp cận
        </Button>

        {/* Preset Locations */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Vị trí mẫu:</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {presetLocations.map((location, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  setLatitude(location.lat)
                  setLongitude(location.lng)
                  setTime(location.time)
                  setTimeout(handleCalculate, 100)
                }}
                className="text-xs h-auto py-2"
              >
                <div className="text-center">
                  <div className="font-medium">{location.name}</div>
                  <div className="text-xs text-gray-500">
                    {location.lat}, {location.lng}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
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
            <h3 className="font-semibold text-gray-900">Kết quả vùng tiếp cận</h3>
            <Badge variant="outline" className="bg-teal-50 text-teal-700">
              Isochrone API
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-800 mb-3">Thông tin vùng</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Điểm xuất phát:</span>
                    <span className="font-semibold">{latitude}, {longitude}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Thời gian tối đa:</span>
                    <span className="font-semibold">{parseInt(time) / 60} phút</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Phương tiện:</span>
                    <span className="font-semibold">
                      {vehicle === 'car' ? 'Ô tô' : 
                       vehicle === 'motorcycle' ? 'Xe máy' : 
                       vehicle === 'bike' ? 'Xe đạp' : 'Xe tải'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Số vùng:</span>
                    <span className="font-semibold">{result.features?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-green-800 mb-3">Mô tả</h4>
                <div className="text-sm text-green-700 space-y-2">
                  <p>Vùng tiếp cận (Isochrone) hiển thị khu vực có thể đến được từ điểm xuất phát trong thời gian đã định.</p>
                  <p>Màu sắc thể hiện thời gian di chuyển khác nhau:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Xanh lá: Thời gian ngắn nhất</li>
                    <li>Vàng: Thời gian trung bình</li>
                    <li>Đỏ: Thời gian dài nhất</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visualization */}
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Mô phỏng vùng tiếp cận</h4>
              <div className="relative h-48 bg-gradient-to-br from-green-50 via-yellow-50 to-red-50 rounded-lg overflow-hidden">
                {/* Simple isochrone visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Target className="h-12 w-12 text-teal-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-1">
                      Vùng tiếp cận trong {parseInt(time) / 60} phút
                    </p>
                    <p className="text-xs text-gray-500">
                      Từ điểm {latitude}, {longitude}
                    </p>
                    <div className="mt-3 flex justify-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* API Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-800">Thông tin API</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• <strong>Endpoint:</strong> GET /api/map/isochrone</p>
              <p>• <strong>Rate Limit:</strong> 40 requests/minute</p>
              <p>• <strong>Parameters:</strong> lat, lng, time, vehicle, format</p>
              <p>• <strong>Time Limits:</strong> 60-3600 giây</p>
              <p>• <strong>Response:</strong> GeoJSON với vùng tiếp cận</p>
              <p>• <strong>Use Case:</strong> Phân tích vùng phục vụ, thời gian di chuyển</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 