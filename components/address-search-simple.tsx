"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Navigation, Search, Loader2, Map, Route, Sparkles, Target, Zap, Clock, Star } from "lucide-react"

interface GeocodeResult {
  place_id: string
  display_name: string
  lat: string
  lon: string
  type: string
  importance: number
  address: {
    road?: string
    suburb?: string
    district?: string
    city?: string
    state?: string
    country?: string
    postcode?: string
  }
}

interface AddressSearchProps {
  onRouteChange: (point1: string, point2: string, vehicle: string) => void
  onAddressChange?: (startAddress: any, endAddress: any) => void
  loading?: boolean
  compact?: boolean
}

export default function AddressSearchSimple({ onRouteChange, onAddressChange, loading = false, compact = false }: AddressSearchProps) {
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

  // Mock data for testing
  const mockData: GeocodeResult[] = [
    {
      place_id: "1",
      display_name: "Bến Thành Market, Quận 1, TP.HCM",
      lat: "10.7729",
      lon: "106.6984",
      type: "market",
      importance: 0.9,
      address: {
        road: "Lê Lợi",
        district: "Quận 1",
        city: "TP.HCM"
      }
    },
    {
      place_id: "2",
      display_name: "Phú Mỹ Hưng, Quận 7, TP.HCM",
      lat: "10.7379",
      lon: "106.7017",
      type: "residential",
      importance: 0.8,
      address: {
        road: "Nguyễn Thị Thập",
        district: "Quận 7",
        city: "TP.HCM"
      }
    },
    {
      place_id: "3",
      display_name: "Võ Thị Sáu, Quận 3, TP.HCM",
      lat: "10.7884",
      lon: "106.7056",
      type: "street",
      importance: 0.7,
      address: {
        road: "Võ Thị Sáu",
        district: "Quận 3",
        city: "TP.HCM"
      }
    },
    {
      place_id: "4",
      display_name: "Thảo Điền, Quận 2, TP.HCM",
      lat: "10.7872",
      lon: "106.7498",
      type: "residential",
      importance: 0.8,
      address: {
        road: "Thảo Điền",
        district: "Quận 2",
        city: "TP.HCM"
      }
    },
    {
      place_id: "5",
      display_name: "Hiệp Phú, Quận 9, TP.HCM",
      lat: "10.8411",
      lon: "106.8098",
      type: "residential",
      importance: 0.6,
      address: {
        road: "Hiệp Phú",
        district: "Quận 9",
        city: "TP.HCM"
      }
    }
  ]

  // Debounced search for start address
  useEffect(() => {
    if (startTimeoutRef.current) {
      clearTimeout(startTimeoutRef.current)
    }

    if (startAddress.trim().length < 2) {
      setStartResults([])
      setShowStartDropdown(false)
      return
    }

    startTimeoutRef.current = setTimeout(() => {
      searchAddress(startAddress, 'start')
    }, 200) // Giảm delay để test

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

    if (endAddress.trim().length < 2) {
      setEndResults([])
      setShowEndDropdown(false)
      return
    }

    endTimeoutRef.current = setTimeout(() => {
      searchAddress(endAddress, 'end')
    }, 200)

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

      console.log(`Searching for: ${address}`)
      
      // Use real API
      const response = await fetch(`/api/map/autocomplete?query=${encodeURIComponent(address)}&limit=8`)
      const result = await response.json()

      console.log('API Response:', result)

      if (result.success) {
        const data = Array.isArray(result.data) ? result.data : []
        console.log(`Found ${data.length} results for ${address}`)
        
        if (type === 'start') {
          setStartResults(data)
          setShowStartDropdown(data.length > 0)
        } else {
          setEndResults(data)
          setShowEndDropdown(data.length > 0)
        }
      } else {
        console.error('API error:', result.error)
        // Fallback to mock data
        const queryLower = address.toLowerCase()
        const filteredData = mockData.filter(item => 
          item.display_name.toLowerCase().includes(queryLower) ||
          item.address.road?.toLowerCase().includes(queryLower) ||
          item.address.district?.toLowerCase().includes(queryLower)
        )
        
        if (type === 'start') {
          setStartResults(filteredData)
          setShowStartDropdown(filteredData.length > 0)
        } else {
          setEndResults(filteredData)
          setShowEndDropdown(filteredData.length > 0)
        }
      }
    } catch (error) {
      console.error('Search error:', error)
      // Fallback to mock data on error
      const queryLower = address.toLowerCase()
      const filteredData = mockData.filter(item => 
        item.display_name.toLowerCase().includes(queryLower) ||
        item.address.road?.toLowerCase().includes(queryLower) ||
        item.address.district?.toLowerCase().includes(queryLower)
      )
      
      if (type === 'start') {
        setStartResults(filteredData)
        setShowStartDropdown(filteredData.length > 0)
      } else {
        setEndResults(filteredData)
        setShowEndDropdown(filteredData.length > 0)
      }
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
    
    // Notify parent component about address change
    if (onAddressChange) {
      onAddressChange(result, selectedEnd)
    }
    
    // Auto search route if both addresses are selected
    if (selectedEnd) {
      const point1 = `${result.lat},${result.lon}`
      const point2 = `${selectedEnd.lat},${selectedEnd.lon}`
      onRouteChange(point1, point2, vehicle)
    }
  }

  const handleEndSelect = (result: GeocodeResult) => {
    setSelectedEnd(result)
    setEndAddress(result.display_name)
    setShowEndDropdown(false)
    
    // Notify parent component about address change
    if (onAddressChange) {
      onAddressChange(selectedStart, result)
    }
    
    // Auto search route if both addresses are selected
    if (selectedStart) {
      const point1 = `${selectedStart.lat},${selectedStart.lon}`
      const point2 = `${result.lat},${result.lon}`
      onRouteChange(point1, point2, vehicle)
    }
  }

  const handleSearch = () => {
    if (selectedStart && selectedEnd) {
      const point1 = `${selectedStart.lat},${selectedStart.lon}`
      const point2 = `${selectedEnd.lat},${selectedEnd.lon}`
      onRouteChange(point1, point2, vehicle)
    }
  }

  const getAddressDisplay = (result: GeocodeResult) => {
    const parts = []
    if (result.address?.road) parts.push(result.address.road)
    if (result.address?.district) parts.push(result.address.district)
    if (result.address?.city) parts.push(result.address.city)
    return parts.join(', ')
  }

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'restaurant': return '🍽️'
      case 'hotel': return '🏨'
      case 'hospital': return '🏥'
      case 'school': return '🏫'
      case 'bank': return '🏦'
      case 'shopping': return '🛍️'
      case 'gas_station': return '⛽'
      case 'market': return '🏪'
      case 'residential': return '🏠'
      case 'street': return '🛣️'
      default: return '📍'
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
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {startResults.map((result, index) => (
                  <button
                    key={result.place_id || index}
                    className="w-full text-left px-4 py-3 hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                    onClick={() => handleStartSelect(result)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-sm">{getAddressTypeIcon(result.type)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">{result.display_name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {getAddressDisplay(result)}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs text-gray-400">{result.importance > 0.5 ? 'Nổi bật' : 'Thường'}</span>
                          </div>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400 capitalize">{result.type}</span>
                        </div>
                      </div>
                    </div>
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
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {endResults.map((result, index) => (
                  <button
                    key={result.place_id || index}
                    className="w-full text-left px-4 py-3 hover:bg-red-50 border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                    onClick={() => handleEndSelect(result)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-sm">{getAddressTypeIcon(result.type)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">{result.display_name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {getAddressDisplay(result)}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs text-gray-400">{result.importance > 0.5 ? 'Nổi bật' : 'Thường'}</span>
                          </div>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400 capitalize">{result.type}</span>
                        </div>
                      </div>
                    </div>
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
          ) : canSearch ? (
            <div className="flex items-center space-x-2">
              <Route className="h-4 w-4" />
              <span>Tìm tuyến đường</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Chọn đủ 2 địa chỉ để tìm đường</span>
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

        {/* Debug Info */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          <p>Debug: Start results: {startResults.length}</p>
          <p>Debug: Show dropdown: {showStartDropdown ? 'Yes' : 'No'}</p>
          <p>Debug: Searching: {searchingStart ? 'Yes' : 'No'}</p>
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
            Tìm đường theo địa chỉ (Simple)
          </span>
        </CardTitle>
        <CardDescription>
          Nhập địa chỉ thực tế để tìm tuyến đường tối ưu với Mock Data
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Same content as compact mode */}
        <div className="space-y-4">
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
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {startResults.map((result, index) => (
                    <button
                      key={result.place_id || index}
                      className="w-full text-left px-4 py-3 hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                      onClick={() => handleStartSelect(result)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-lg">{getAddressTypeIcon(result.type)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate">{result.display_name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {getAddressDisplay(result)}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs text-gray-400">{result.importance > 0.5 ? 'Địa điểm nổi bật' : 'Địa điểm thường'}</span>
                            </div>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-400 capitalize">{result.type}</span>
                          </div>
                        </div>
                      </div>
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
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {endResults.map((result, index) => (
                    <button
                      key={result.place_id || index}
                      className="w-full text-left px-4 py-3 hover:bg-red-50 border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                      onClick={() => handleEndSelect(result)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-lg">{getAddressTypeIcon(result.type)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate">{result.display_name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {getAddressDisplay(result)}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs text-gray-400">{result.importance > 0.5 ? 'Địa điểm nổi bật' : 'Địa điểm thường'}</span>
                            </div>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-400 capitalize">{result.type}</span>
                          </div>
                        </div>
                      </div>
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
                      ) : canSearch ? (
            <div className="flex items-center space-x-2">
              <Route className="h-4 w-4" />
              <span>Tìm tuyến đường</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Chọn đủ 2 địa chỉ để tìm đường</span>
            </div>
          )}
          </Button>

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

                  {/* Debug Info */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          <p>Debug: Start results: {startResults.length}</p>
          <p>Debug: Show dropdown: {showStartDropdown ? 'Yes' : 'No'}</p>
          <p>Debug: Searching: {searchingStart ? 'Yes' : 'No'}</p>
          <p>Debug: Start address: "{startAddress}"</p>
          <p>Debug: Start address length: {startAddress.length}</p>
          <p>Debug: Selected start: {selectedStart ? selectedStart.display_name : 'None'}</p>
          <p>Debug: Selected end: {selectedEnd ? selectedEnd.display_name : 'None'}</p>
          <p>Debug: Can search: {canSearch ? 'Yes' : 'No'}</p>
          <p className="text-green-600 font-medium">✅ Sử dụng dữ liệu thực tế từ OpenStreetMap</p>
          <p className="text-blue-600 font-medium">📍 Marker sẽ hiển thị trên bản đồ khi chọn địa chỉ</p>
          <p className="text-purple-600 font-medium">🛣️ Tự động vẽ đường đi khi chọn đủ 2 địa chỉ</p>
        </div>
        </div>
      </CardContent>
    </Card>
  )
} 