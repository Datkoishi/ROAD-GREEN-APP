"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Loader2, Copy, CheckCircle, AlertCircle } from "lucide-react"

interface GeocodingResult {
  display_name: string
  lat: string
  lon: string
  type: string
  importance: number
}

export default function GeocodingFeature() {
  const [address, setAddress] = useState("")
  const [results, setResults] = useState<GeocodingResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!address.trim()) return

    setLoading(true)
    setError(null)
    setResults([])

    try {
      const response = await fetch(`/api/map/geocoding?address=${encodeURIComponent(address)}&limit=10`)
      const data = await response.json()

      if (data.success) {
        setResults(data.data || [])
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

  const presetAddresses = [
    "Bến Thành, Quận 1, TP.HCM",
    "Phú Mỹ Hưng, Quận 7, TP.HCM",
    "Võ Thị Sáu, Quận 3, TP.HCM",
    "Thảo Điền, Quận 2, TP.HCM"
  ]

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-semibold">
            Nhập địa chỉ cần tìm kiếm
          </Label>
          <div className="flex space-x-2">
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ví dụ: Bến Thành, Quận 1, TP.HCM"
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              onClick={handleSearch} 
              disabled={loading || !address.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Preset Addresses */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Địa chỉ mẫu:</Label>
          <div className="flex flex-wrap gap-2">
            {presetAddresses.map((preset, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  setAddress(preset)
                  setTimeout(handleSearch, 100)
                }}
                className="text-xs"
              >
                {preset}
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
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Kết quả tìm kiếm ({results.length})
            </h3>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              VietMap API
            </Badge>
          </div>

          <div className="space-y-3">
            {results.map((result, index) => (
              <Card key={index} className="border-gray-200 hover:border-blue-300 transition-colors">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {result.display_name}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{result.lat}, {result.lon}</span>
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {result.type}
                          </Badge>
                          <span>Độ quan trọng: {(result.importance * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(result.display_name, `name-${index}`)}
                          className="h-8 w-8 p-0"
                        >
                          {copied === `name-${index}` ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(`${result.lat},${result.lon}`, `coord-${index}`)}
                          className="h-8 w-8 p-0"
                        >
                          {copied === `coord-${index}` ? (
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
            ))}
          </div>
        </div>
      )}

      {/* API Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-800">Thông tin API</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• <strong>Endpoint:</strong> GET /api/map/geocoding</p>
              <p>• <strong>Rate Limit:</strong> 100 requests/minute</p>
              <p>• <strong>Parameters:</strong> address, limit, format</p>
              <p>• <strong>Response:</strong> JSON với tọa độ và thông tin địa chỉ</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 