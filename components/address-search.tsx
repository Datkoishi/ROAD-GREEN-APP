"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Navigation, Search, Loader2, Map, Route, Sparkles, Target, Zap } from "lucide-react"

interface GeocodeResult {
  address: string
  latitude: number
  longitude: number
  display_name: string
  type: string
  importance: number
}

interface AddressSearchProps {
  onRouteChange: (point1: string, point2: string, vehicle: string) => void
  loading?: boolean
  compact?: boolean
}

export default function AddressSearch({ onRouteChange, loading = false, compact = false }: AddressSearchProps) {
  const [startAddress, setStartAddress] = useState("")
  const [endAddress, setEndAddress] = useState("")
  const [vehicle, setVehicle] = useState("car")
  
  const [startResults, setStartResults] = useState<GeocodeResult[]>([])
  const [endResults, setEndResults] = useState<GeocodeResult[]>([])
  const [showStartDropdown, setShowStartDropdown] = useState(false)
  const [showEndDropdown, setShowEndDropdown] = useState(false)
  const [searchingStart, setSearchingStart] = useState(false)
  const [searchingEnd, setSearchingEnd] = useState(false)
  
  const [selectedStart, setSelectedStart] = useState<GeocodeResult | null>(null)
  const [selectedEnd, setSelectedEnd] = useState<GeocodeResult | null>(null)
  
  const startTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const endTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced search for start address
  useEffect(() => {
    if (startTimeoutRef.current) {
      clearTimeout(startTimeoutRef.current)
    }

    if (startAddress.trim().length < 3) {
      setStartResults([])
      setShowStartDropdown(false)
      return
    }

    startTimeoutRef.current = setTimeout(() => {
      searchAddress(startAddress, 'start')
    }, 500)

    return () => {
      if (startTimeoutRef.current) {
        clearTimeout(startTimeoutRef.current)
      }
    }
  }, [startAddress])

  // Debounced search for end address
  useEffect(() => {
    if (endTimeoutRef.current) {
      clearTimeout(endTimeoutRef.current)
    }

    if (endAddress.trim().length < 3) {
      setEndResults([])
      setShowEndDropdown(false)
      return
    }

    endTimeoutRef.current = setTimeout(() => {
      searchAddress(endAddress, 'end')
    }, 500)

    return () => {
      if (endTimeoutRef.current) {
        clearTimeout(endTimeoutRef.current)
      }
    }
  }, [endAddress])

  const searchAddress = async (address: string, type: 'start' | 'end') => {
    try {
      if (type === 'start') {
        setSearchingStart(true)
      } else {
        setSearchingEnd(true)
      }

      const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`)
      const result = await response.json()

      if (result.success) {
        if (type === 'start') {
          setStartResults(result.data.results)
          setShowStartDropdown(true)
        } else {
          setEndResults(result.data.results)
          setShowEndDropdown(true)
        }
      } else {
        console.error('Geocoding error:', result.error)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      if (type === 'start') {
        setSearchingStart(false)
      } else {
        setSearchingEnd(false)
      }
    }
  }

  const handleStartSelect = (result: GeocodeResult) => {
    setSelectedStart(result)
    setStartAddress(result.display_name)
    setShowStartDropdown(false)
  }

  const handleEndSelect = (result: GeocodeResult) => {
    setSelectedEnd(result)
    setEndAddress(result.display_name)
    setShowEndDropdown(false)
  }

  const handleSearch = () => {
    if (selectedStart && selectedEnd) {
      const point1 = `${selectedStart.latitude},${selectedStart.longitude}`
      const point2 = `${selectedEnd.latitude},${selectedEnd.longitude}`
      onRouteChange(point1, point2, vehicle)
    }
  }

  const presetAddresses = [
    {
      name: "Quận 1 → Quận 3",
      start: "Bến Thành, Quận 1, TP.HCM",
      end: "Võ Thị Sáu, Quận 3, TP.HCM"
    },
    {
      name: "Quận 7 → Quận 1",
      start: "Phú Mỹ Hưng, Quận 7, TP.HCM",
      end: "Bến Thành, Quận 1, TP.HCM"
    },
    {
      name: "Quận 9 → Quận 2",
      start: "Hiệp Phú, Quận 9, TP.HCM",
      end: "Thảo Điền, Quận 2, TP.HCM"
    }
  ]

  const handlePresetAddress = (preset: typeof presetAddresses[0]) => {
    setStartAddress(preset.start)
    setEndAddress(preset.end)
    // Trigger search for both addresses
    searchAddress(preset.start, 'start')
    searchAddress(preset.end, 'end')
  }

  const canSearch = selectedStart && selectedEnd && !loading

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Start Address */}
        <div className="space-y-2">
          <Label htmlFor="startAddress" className="flex items-center space-x-2 text-sm font-semibold">
            <div className="p-1 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-lg shadow-md">
              <MapPin className="h-3 w-3 text-white" />
            </div>
            <span>Điểm xuất phát</span>
          </Label>
          <div className="relative group">
            <Input
              id="startAddress"
              value={startAddress}
              onChange={(e) => setStartAddress(e.target.value)}
              placeholder="Nhập địa chỉ xuất phát..."
              className="pr-10 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-300 group-hover:border-gray-300"
            />
            {searchingStart && (
              <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3 text-green-500" />
            )}
            {showStartDropdown && startResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-300">
                {startResults.map((result, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-4 py-3 hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                    onClick={() => handleStartSelect(result)}
                  >
                    <div className="font-medium text-sm text-gray-900">{result.display_name}</div>
                    <div className="text-xs text-gray-500">{result.type}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* End Address */}
        <div className="space-y-2">
          <Label htmlFor="endAddress" className="flex items-center space-x-2 text-sm font-semibold">
            <div className="p-1 bg-gradient-to-br from-red-500 via-pink-600 to-rose-700 rounded-lg shadow-md">
              <Target className="h-3 w-3 text-white" />
            </div>
            <span>Điểm đến</span>
          </Label>
          <div className="relative group">
            <Input
              id="endAddress"
              value={endAddress}
              onChange={(e) => setEndAddress(e.target.value)}
              placeholder="Nhập địa chỉ đích..."
              className="pr-10 border-gray-200 focus:border-red-500 focus:ring-red-500/20 transition-all duration-300 group-hover:border-gray-300"
            />
            {searchingEnd && (
              <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3 text-red-500" />
            )}
            {showEndDropdown && endResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-300">
                {endResults.map((result, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-4 py-3 hover:bg-red-50 border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                    onClick={() => handleEndSelect(result)}
                  >
                    <div className="font-medium text-sm text-gray-900">{result.display_name}</div>
                    <div className="text-xs text-gray-500">{result.type}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Type */}
        <div className="space-y-2">
          <Label htmlFor="vehicle" className="text-sm font-semibold">Loại phương tiện</Label>
          <Select value={vehicle} onValueChange={setVehicle}>
            <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300">
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
          disabled={!canSearch}
          className="w-full bg-gradient-to-r from-blue-600 via-green-600 to-emerald-600 hover:from-blue-700 hover:via-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang tìm tuyến đường...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Route className="h-4 w-4" />
              <span>Tìm tuyến đường</span>
            </div>
          )}
        </Button>

        {/* Preset Addresses */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center space-x-2">
            <Sparkles className="h-3 w-3 text-purple-600" />
            <span>Địa chỉ mẫu</span>
          </Label>
          <div className="grid grid-cols-1 gap-2">
            {presetAddresses.map((preset, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handlePresetAddress(preset)}
                disabled={loading}
                className="justify-start text-left h-auto py-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300"
              >
                <MapPin className="h-3 w-3 mr-2 text-purple-600" />
                <span className="text-xs">{preset.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-b border-gray-200/50">
        <CardTitle className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-lg shadow-lg">
            <Map className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent font-bold">
            Tìm đường theo địa chỉ
          </span>
        </CardTitle>
        <CardDescription>
          Nhập địa chỉ thực tế để tìm tuyến đường tối ưu
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Start Address */}
        <div className="space-y-2">
          <Label htmlFor="startAddress" className="flex items-center space-x-2">
            <div className="p-1 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-lg shadow-md">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span>Điểm xuất phát</span>
          </Label>
          <div className="relative group">
            <Input
              id="startAddress"
              value={startAddress}
              onChange={(e) => setStartAddress(e.target.value)}
              placeholder="Nhập địa chỉ xuất phát..."
              className="pr-10 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-300 group-hover:border-gray-300"
            />
            {searchingStart && (
              <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3 text-green-500" />
            )}
            {showStartDropdown && startResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-300">
                {startResults.map((result, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-4 py-3 hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                    onClick={() => handleStartSelect(result)}
                  >
                    <div className="font-medium text-sm text-gray-900">{result.display_name}</div>
                    <div className="text-xs text-gray-500">{result.type}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* End Address */}
        <div className="space-y-2">
          <Label htmlFor="endAddress" className="flex items-center space-x-2">
            <div className="p-1 bg-gradient-to-br from-red-500 via-pink-600 to-rose-700 rounded-lg shadow-md">
              <Target className="h-4 w-4 text-white" />
            </div>
            <span>Điểm đến</span>
          </Label>
          <div className="relative group">
            <Input
              id="endAddress"
              value={endAddress}
              onChange={(e) => setEndAddress(e.target.value)}
              placeholder="Nhập địa chỉ đích..."
              className="pr-10 border-gray-200 focus:border-red-500 focus:ring-red-500/20 transition-all duration-300 group-hover:border-gray-300"
            />
            {searchingEnd && (
              <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3 text-red-500" />
            )}
            {showEndDropdown && endResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-300">
                {endResults.map((result, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-4 py-3 hover:bg-red-50 border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                    onClick={() => handleEndSelect(result)}
                  >
                    <div className="font-medium text-sm text-gray-900">{result.display_name}</div>
                    <div className="text-xs text-gray-500">{result.type}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Type */}
        <div className="space-y-2">
          <Label htmlFor="vehicle">Loại phương tiện</Label>
          <Select value={vehicle} onValueChange={setVehicle}>
            <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300">
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
          disabled={!canSearch}
          className="w-full bg-gradient-to-r from-blue-600 via-green-600 to-emerald-600 hover:from-blue-700 hover:via-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang tìm tuyến đường...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Route className="h-4 w-4" />
              <span>Tìm tuyến đường</span>
            </div>
          )}
        </Button>

        {/* Selected Addresses Display */}
        {(selectedStart || selectedEnd) && (
          <div className="space-y-2 p-4 bg-gradient-to-r from-gray-50 via-blue-50 to-emerald-50 rounded-lg border border-gray-200/50">
            <h4 className="text-sm font-semibold text-gray-700">Địa chỉ đã chọn:</h4>
            {selectedStart && (
              <div className="text-xs text-gray-600 flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"></div>
                <span className="font-medium text-green-600">Từ:</span> {selectedStart.display_name}
              </div>
            )}
            {selectedEnd && (
              <div className="text-xs text-gray-600 flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-full"></div>
                <span className="font-medium text-red-600">Đến:</span> {selectedEnd.display_name}
              </div>
            )}
          </div>
        )}

        {/* Preset Addresses */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span>Địa chỉ mẫu</span>
          </Label>
          <div className="grid grid-cols-1 gap-2">
            {presetAddresses.map((preset, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handlePresetAddress(preset)}
                disabled={loading}
                className="justify-start text-left border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300"
              >
                <MapPin className="h-3 w-3 mr-2 text-purple-600" />
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200/50">
          <p><strong>Hướng dẫn:</strong></p>
          <p>• Nhập địa chỉ thực tế (ví dụ: "Bến Thành, Quận 1")</p>
          <p>• Chọn địa chỉ chính xác từ danh sách gợi ý</p>
          <p>• Hoặc sử dụng địa chỉ mẫu có sẵn</p>
        </div>
      </CardContent>
    </Card>
  )
} 