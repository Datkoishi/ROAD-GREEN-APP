"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Droplets, Car } from "lucide-react"

export default function MapView() {
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => setMapLoaded(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const trafficIncidents = [
    { id: 1, type: "flood", location: "Nguyễn Văn Linh", severity: "high" },
    { id: 2, type: "traffic", location: "Cầu Sài Gòn", severity: "medium" },
    { id: 3, type: "flood", location: "Võ Văn Kiệt", severity: "low" },
  ]

  if (!mapLoaded) {
    return (
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Đang tải bản đồ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg relative overflow-hidden">
        {/* Simulated map background */}
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 400 300" className="w-full h-full">
            <path d="M0,150 Q100,100 200,150 T400,150" stroke="#10b981" strokeWidth="3" fill="none" />
            <path d="M0,100 Q150,50 300,100 T400,100" stroke="#3b82f6" strokeWidth="2" fill="none" />
            <path d="M0,200 Q120,180 240,200 T400,200" stroke="#6b7280" strokeWidth="2" fill="none" />
          </svg>
        </div>

        {/* Traffic incidents overlay */}
        <div className="absolute inset-0 p-4">
          <div className="absolute top-4 left-8 flex items-center space-x-1">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Ngập nước</span>
          </div>

          <div className="absolute top-16 right-12 flex items-center space-x-1">
            <Car className="h-4 w-4 text-red-500" />
            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">Kẹt xe</span>
          </div>

          <div className="absolute bottom-8 left-16 flex items-center space-x-1">
            <Droplets className="h-4 w-4 text-yellow-500" />
            <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded">Ngập nhẹ</span>
          </div>
        </div>

        {/* Map controls */}
        <div className="absolute bottom-4 right-4 space-y-2">
          <div className="bg-white rounded shadow p-2 text-xs">
            <div className="flex items-center space-x-1 mb-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Ngập nước</span>
            </div>
            <div className="flex items-center space-x-1 mb-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Kẹt xe</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Cảnh báo nhẹ</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-sm">Cảnh báo giao thông hiện tại</h4>
        {trafficIncidents.map((incident) => (
          <div key={incident.id} className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              {incident.type === "flood" ? (
                <Droplets className="h-3 w-3 text-blue-500" />
              ) : (
                <Car className="h-3 w-3 text-red-500" />
              )}
              <span>{incident.location}</span>
            </div>
            <Badge
              variant={
                incident.severity === "high" ? "destructive" : incident.severity === "medium" ? "default" : "secondary"
              }
              className="text-xs"
            >
              {incident.severity === "high" ? "Nghiêm trọng" : incident.severity === "medium" ? "Trung bình" : "Nhẹ"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
