"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Loader2, Copy, CheckCircle, Search } from "lucide-react"

interface AutocompleteResult {
  display_name: string
  lat: string
  lon: string
  type: string
  importance: number
}

export default function AutocompleteFeature() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<AutocompleteResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced search
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (query.trim().length < 2) {
      setResults([])
      setShowDropdown(false)
      return
    }

    timeoutRef.current = setTimeout(() => {
      handleSearch()
    }, 300)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [query])

  const handleSearch = async () => {
    if (!query.trim() || query.trim().length < 2) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/map/autocomplete?q=${encodeURIComponent(query)}&limit=8`)
      const data = await response.json()

      if (data.success) {
        setResults(data.data || [])
        setShowDropdown(true)
      } else {
        setError(data.error || "Lỗi khi tìm kiếm")
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

  const handleResultSelect = (result: AutocompleteResult) => {
    setQuery(result.display_name)
    setShowDropdown(false)
    setResults([result]) // Show only selected result
  }

  const presetQueries = [
    "Bến Thành",
    "Phú Mỹ Hưng",
    "Võ Thị Sáu",
    "Thảo Điền",
    "Landmark",
    "Diamond Plaza"
  ]

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="query" className="text-sm font-semibold">
            Nhập từ khóa để tìm kiếm nhanh
          </Label>
          <div className="relative">
            <Input
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Bắt đầu nhập để xem gợi ý..."
              className="pr-10"
            />
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3 text-gray-400" />
            )}
            
            {/* Dropdown Results */}
            {showDropdown && results.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {results.map((result, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    onClick={() => handleResultSelect(result)}
                  >
                    <div className="font-medium text-sm text-gray-900">{result.display_name}</div>
                    <div className="text-xs text-gray-500 flex items-center justify-between">
                      <span>{result.type}</span>
                      <span>{(result.importance * 100).toFixed(1)}%</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Tự động tìm kiếm sau 300ms khi nhập (debounced)
          </p>
        </div>

        {/* Preset Queries */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Từ khóa mẫu:</Label>
          <div className="flex flex-wrap gap-2">
            {presetQueries.map((preset, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setQuery(preset)}
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
      {results.length > 0 && !showDropdown && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Kết quả tìm kiếm ({results.length})
            </h3>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              Auto Complete
            </Badge>
          </div>

          <div className="space-y-3">
            {results.map((result, index) => (
              <Card key={index} className="border-gray-200 hover:border-purple-300 transition-colors">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {result.display_name}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>📍 {result.lat}, {result.lon}</span>
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
              <p>• <strong>Endpoint:</strong> GET /api/map/autocomplete</p>
              <p>• <strong>Rate Limit:</strong> 150 requests/minute</p>
              <p>• <strong>Parameters:</strong> q, limit, format</p>
              <p>• <strong>Debounced:</strong> 300ms delay để tối ưu hiệu suất</p>
              <p>• <strong>Response:</strong> JSON với gợi ý địa điểm</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 