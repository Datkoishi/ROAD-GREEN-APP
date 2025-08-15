"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Clock, Car, Route, Loader2, AlertCircle } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamic import để tránh SSR issues với Leaflet
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
  ssr: false,
  loading: () => <div className="h-full bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
      <p className="text-sm text-gray-600">Đang tải bản đồ...</p>
    </div>
  </div>
})

const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), {
  ssr: false
})

const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), {
  ssr: false
})

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false
})

const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), {
  ssr: false
})

// Leaflet sẽ được import trong component để tránh SSR issues

interface RouteInstruction {
  distance: number
  heading: number
  sign: number
  interval: number[]
  text: string
  time: number
  street_name: string
  last_heading: number | null
}

interface RoutePath {
  distance: number
  weight: number
  time: number
  transfers: number
  points_encoded: boolean
  bbox: number[]
  points: string
  instructions: RouteInstruction[]
  snapped_waypoints: string
}

interface VietMapResponse {
  license: string
  code: string
  messages: any
  paths: RoutePath[]
}

// Decode polyline từ VietMap API
function decodePolyline(encoded: string): [number, number][] {
  const poly: [number, number][] = []
  let index = 0
  let len = encoded.length
  let lat = 0
  let lng = 0

  while (index < len) {
    let shift = 0
    let result = 0

    do {
      let b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (result >= 0x20)

    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1))
    lat += dlat

    shift = 0
    result = 0

    do {
      let b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (result >= 0x20)

    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1))
    lng += dlng

    poly.push([lat / 1e5, lng / 1e5])
  }

  return poly
}

// Custom markers - sẽ được tạo trong component để tránh SSR issues
const createCustomIcon = (color: string, L: any) => {
  return new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
      </svg>
    `)}`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  })
}

export default function RealMap({ 
  point1 = "10.7729,106.6984", 
  point2 = "10.7884,106.7056", 
  vehicle = "car",
  onRouteChange,
  onRouteDataChange,
  className,
  selectedStartAddress,
  selectedEndAddress
}: {
  point1?: string
  point2?: string
  vehicle?: string
  onRouteChange?: (point1: string, point2: string, vehicle: string) => void
  onRouteDataChange?: (data: VietMapResponse) => void
  className?: string
  selectedStartAddress?: any
  selectedEndAddress?: any
}) {
  const [routeData, setRouteData] = useState<VietMapResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRoute, setSelectedRoute] = useState(0)
  const [mapCenter, setMapCenter] = useState<[number, number]>([10.7806, 106.7019]) // TP.HCM center
  
  // Import Leaflet dynamically to avoid SSR issues
  const [L, setL] = useState<any>(null)
  
  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet.default)
    })
  }, [])

  useEffect(() => {
    fetchRouteData()
  }, [point1, point2, vehicle])

  const fetchRouteData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Sử dụng VietMap Routing API thực tế
      const response = await fetch(
        `/api/map/routing?point1=${point1}&point2=${point2}&vehicle=${vehicle}`
      )
      
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu tuyến đường")
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || "Lỗi từ VietMap API")
      }
      
      setRouteData(result.data)
      
      // Truyền dữ liệu route về component cha
      if (onRouteDataChange) {
        onRouteDataChange(result.data)
      }
      
      // Cập nhật center map dựa trên bbox của tuyến đường
      if (result.data.paths && result.data.paths.length > 0) {
        const bbox = result.data.paths[0].bbox
        const centerLat = (bbox[1] + bbox[3]) / 2
        const centerLng = (bbox[0] + bbox[2]) / 2
        setMapCenter([centerLat, centerLng])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định")
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
      case 'car':
        return '🚗'
      case 'motorcycle':
        return '🏍️'
      case 'bike':
        return '🚲'
      case 'truck':
        return '🚛'
      default:
        return '🚗'
    }
  }

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center ${className || 'h-96'}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Đang tải bản đồ VietMap...</p>
          <p className="text-sm text-gray-500 mt-2">Tìm tuyến đường tối ưu</p>
        </div>
          </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-gradient-to-br from-red-50 to-orange-50 rounded-lg flex items-center justify-center ${className || 'h-96'}`}>
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 font-medium mb-2">{error}</p>
            <button 
              onClick={fetchRouteData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
      </div>
    )
  }

  if (!routeData || !routeData.paths || routeData.paths.length === 0) {
    return (
      <div className={`bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg flex items-center justify-center ${className || 'h-96'}`}>
        <div className="text-center">
          <MapPin className="h-8 w-8 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Không tìm thấy tuyến đường</p>
          <p className="text-sm text-gray-500 mt-2">Vui lòng kiểm tra lại điểm xuất phát và đích</p>
        </div>
          </div>
    )
  }

  const currentRoute = routeData.paths[selectedRoute]
  const routePoints = decodePolyline(currentRoute.points)
  const startPoint = routePoints[0]
  const endPoint = routePoints[routePoints.length - 1]

  // Custom icons - chỉ tạo khi L đã được load
  const startIcon = L ? createCustomIcon('#10B981', L) : null // Green
  const endIcon = L ? createCustomIcon('#EF4444', L) : null   // Red

  return (
    <div className={`relative ${className || 'h-96'}`}>
        {/* Route Selection */}
        {routeData.paths.length > 1 && (
        <div className="absolute top-4 left-4 z-10 flex space-x-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
            {routeData.paths.map((path, index) => (
              <button
                key={index}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  selectedRoute === index 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setSelectedRoute(index)}
              >
                Tuyến {index + 1}
              </button>
            ))}
          </div>
        )}

      {/* Map Container */}
          <MapContainer
            center={mapCenter}
            zoom={14}
            style={{ height: "100%", width: "100%" }}
        className="rounded-lg overflow-hidden"
          >
            {/* VietMap Tile Layer */}
            <TileLayer
              attribution='&copy; <a href="https://vietmap.vn">VietMap</a> contributors'
              url="https://maps.vietmap.vn/api/tm/{z}/{x}/{y}@2x.png?apikey=6856756a5a89e36f1acd124738137de6ec22f32a8b94a444"
            />
            
            {/* Start Marker */}
            {startIcon && (
              <Marker position={startPoint as [number, number]} icon={startIcon}>
                <Popup>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">🚀 Điểm xuất phát</div>
                    {selectedStartAddress ? (
                      <div className="text-sm text-gray-600 mt-1">
                        <div className="font-medium">{selectedStartAddress.display_name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {selectedStartAddress.lat}, {selectedStartAddress.lon}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        {startPoint[0].toFixed(6)}, {startPoint[1].toFixed(6)}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* End Marker */}
            {endIcon && (
              <Marker position={endPoint as [number, number]} icon={endIcon}>
                <Popup>
                  <div className="text-center">
                    <div className="font-semibold text-red-600">🎯 Điểm đến</div>
                    {selectedEndAddress ? (
                      <div className="text-sm text-gray-600 mt-1">
                        <div className="font-medium">{selectedEndAddress.display_name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {selectedEndAddress.lat}, {selectedEndAddress.lon}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        {endPoint[0].toFixed(6)}, {endPoint[1].toFixed(6)}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Route Line with gradient effect */}
            <Polyline
              positions={routePoints.map(point => [point[0], point[1]] as [number, number])}
              color="#3B82F6"
              weight={6}
              opacity={0.8}
              lineCap="round"
              lineJoin="round"
            />
            
            {/* Additional route line for shadow effect */}
            <Polyline
              positions={routePoints.map(point => [point[0], point[1]] as [number, number])}
              color="#1E40AF"
              weight={8}
              opacity={0.3}
              lineCap="round"
              lineJoin="round"
            />
          </MapContainer>

      {/* Route Info Overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Navigation className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-gray-600">Khoảng cách</span>
              </div>
              <p className="font-semibold text-sm text-gray-900">{formatDistance(currentRoute.distance)}</p>
          </div>
          
            <div>
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-xs text-gray-600">Thời gian</span>
              </div>
              <p className="font-semibold text-sm text-gray-900">{formatTime(currentRoute.time)}</p>
          </div>
          
            <div>
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Car className="h-4 w-4 text-orange-600" />
                <span className="text-xs text-gray-600">Phương tiện</span>
              </div>
              <p className="font-semibold text-sm text-gray-900">{getVehicleIcon(vehicle)} {vehicle === 'car' ? 'Ô tô' : vehicle === 'motorcycle' ? 'Xe máy' : vehicle === 'bike' ? 'Xe đạp' : 'Xe tải'}</p>
            </div>
          </div>
        </div>
          </div>
        </div>
  )
} 