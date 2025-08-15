"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Loader2, Plus, X, AlertCircle } from "lucide-react"

interface MatrixResult {
  distances: number[][]
  times: number[][]
}

export default function MatrixFeature() {
  const [points, setPoints] = useState<string[]>(["10.7729,106.6984", "10.7884,106.7056"])
  const [vehicle, setVehicle] = useState("car")
  const [result, setResult] = useState<MatrixResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addPoint = () => {
    if (points.length < 10) {
      setPoints([...points, ""])
    }
  }

  const removePoint = (index: number) => {
    if (points.length > 2) {
      setPoints(points.filter((_, i) => i !== index))
    }
  }

  const updatePoint = (index: number, value: string) => {
    const newPoints = [...points]
    newPoints[index] = value
    setPoints(newPoints)
  }

  const handleCalculate = async () => {
    const validPoints = points.filter(p => p.trim())
    if (validPoints.length < 2) {
      setError("Cần ít nhất 2 điểm để tính toán")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/map/matrix?points=${validPoints.join(',')}&vehicle=${vehicle}`)
      const data = await response.json()

      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || "Lỗi khi tính toán ma trận")
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
      return `${hours}h ${remainingMinutes}m`
    }
    return `${minutes}m`
  }

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`
    }
    return `${meters} m`
  }

  const presetPoints = [
    "10.7729,106.6984", // Bến Thành
    "10.7884,106.7056", // Quận 3
    "10.7379,106.7017", // Quận 7
    "10.7872,106.7498"  // Quận 2
  ]

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Nhập các điểm (tối đa 10 điểm)</Label>
          <div className="space-y-2">
            {points.map((point, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  value={point}
                  onChange={(e) => updatePoint(index, e.target.value)}
                  placeholder="lat,lng (ví dụ: 10.7729,106.6984)"
                  className="flex-1"
                />
                {points.length > 2 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removePoint(index)}
                    className="px-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          {points.length < 10 && (
            <Button variant="outline" size="sm" onClick={addPoint} className="mt-2">
              <Plus className="h-4 w-4 mr-1" />
              Thêm điểm
            </Button>
          )}
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
          disabled={loading || points.filter(p => p.trim()).length < 2}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Clock className="h-4 w-4" />
          )}
          Tính toán ma trận
        </Button>

        {/* Preset Points */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Điểm mẫu:</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPoints(presetPoints)}
            className="text-xs"
          >
            Sử dụng điểm mẫu TP.HCM
          </Button>
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
            <h3 className="font-semibold text-gray-900">Kết quả ma trận</h3>
            <Badge variant="outline" className="bg-orange-50 text-orange-700">
              Matrix API
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Distance Matrix */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-800 mb-3">Ma trận khoảng cách (km)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="text-left p-1">Từ/Đến</th>
                        {points.map((_, i) => (
                          <th key={i} className="p-1 text-center">P{i+1}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.distances.map((row, i) => (
                        <tr key={i}>
                          <td className="p-1 font-medium">P{i+1}</td>
                          {row.map((distance, j) => (
                            <td key={j} className="p-1 text-center">
                              {formatDistance(distance)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Time Matrix */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-green-800 mb-3">Ma trận thời gian</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="text-left p-1">Từ/Đến</th>
                        {points.map((_, i) => (
                          <th key={i} className="p-1 text-center">P{i+1}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.times.map((row, i) => (
                        <tr key={i}>
                          <td className="p-1 font-medium">P{i+1}</td>
                          {row.map((time, j) => (
                            <td key={j} className="p-1 text-center">
                              {formatTime(time)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
              <p>• <strong>Endpoint:</strong> GET /api/map/matrix</p>
              <p>• <strong>Rate Limit:</strong> 50 requests/minute</p>
              <p>• <strong>Parameters:</strong> points, vehicle, format</p>
              <p>• <strong>Limits:</strong> 2-25 điểm</p>
              <p>• <strong>Response:</strong> Ma trận khoảng cách và thời gian</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 