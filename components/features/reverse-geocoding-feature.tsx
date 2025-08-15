"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Loader2, Copy, CheckCircle, Navigation, AlertCircle } from "lucide-react"

interface ReverseGeocodingResult {
  display_name: string
  address: {
    road?: string
    suburb?: string
    district?: string
    city?: string
    country?: string
  }
  lat: string
  lon: string
}

export default function ReverseGeocodingFeature() {
  const [latitude, setLatitude] = useState("10.7729")
  const [longitude, setLongitude] = useState("106.6984")
  const [result, setResult] = useState<ReverseGeocodingResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!latitude.trim() || !longitude.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/map/reverse-geocoding?lat=${latitude}&lng=${longitude}`)
      const data = await response.json()

      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || "Lỗi khi tìm kiếm địa chỉ")
      }
    } catch (err) {
      setError("Lỗi kết nối mạng")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error("Lỗi khi copy:", err)
    }
  }

  const presetCoordinates = [
    { lat: "10.7729", lng: "106.6984", name: "Bến Thành" },
    { lat: "10.7884", lng: "106.7056", name: "Quận 3" },
    { lat: "10.7379", lng: "106.7017", name: "Quận 7" },
    { lat: "10.7872", lng: "106.7498", name: "Quận 2" }
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

        <Button 
          onClick={handleSearch} 
          disabled={loading || !latitude.trim() || !longitude.trim()}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          Tìm địa chỉ từ tọa độ
        </Button>

        {/* Preset Coordinates */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Tọa độ mẫu:</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {presetCoordinates.map((coord, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  setLatitude(coord.lat)
                  setLongitude(coord.lng)
                  setTimeout(handleSearch, 100)
                }}
                className="text-xs h-auto py-2"
              >
                <div className="text-center">
                  <div className="font-medium">{coord.name}</div>
                  <div className="text-xs text-gray-500">
                    {coord.lat}, {coord.lng}
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
            <h3 className="font-semibold text-gray-900">Kết quả tìm kiếm</h3>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              VietMap API
            </Badge>
          </div>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {result.display_name}
                    </h4>
                    
                    <div className="space-y-2">
                      {result.address.road && (
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="h-3 w-3 text-gray-500" />
                          <span className="text-gray-700">
                            <strong>Đường:</strong> {result.address.road}
                          </span>
                        </div>
                      )}
                      {result.address.suburb && (
                        <div className="text-sm text-gray-600">
                          <strong>Phường:</strong> {result.address.suburb}
                        </div>
                      )}
                      {result.address.district && (
                        <div className="text-sm text-gray-600">
                          <strong>Quận:</strong> {result.address.district}
                        </div>
                      )}
                      {result.address.city && (
                        <div className="text-sm text-gray-600">
                          <strong>Thành phố:</strong> {result.address.city}
                        </div>
                      )}
                      {result.address.country && (
                        <div className="text-sm text-gray-600">
                          <strong>Quốc gia:</strong> {result.address.country}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 text-sm text-gray-500">
                      <strong>Tọa độ:</strong> {result.lat}, {result.lon}
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(result.display_name, 'name')}
                      className="h-8 w-8 p-0"
                    >
                      {copied === 'name' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`${result.lat},${result.lon}`, 'coord')}
                      className="h-8 w-8 p-0"
                    >
                      {copied === 'coord' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
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
              <p>• <strong>Endpoint:</strong> GET /api/map/reverse-geocoding</p>
              <p>• <strong>Rate Limit:</strong> 100 requests/minute</p>
              <p>• <strong>Parameters:</strong> lat, lng, format</p>
              <p>• <strong>Response:</strong> JSON với thông tin địa chỉ chi tiết</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 