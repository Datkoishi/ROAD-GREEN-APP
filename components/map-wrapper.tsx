"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

// Dynamic import cho RealMap để tránh SSR issues
const RealMap = dynamic(() => import("./real-map"), {
  ssr: false,
  loading: () => (
    <div className="h-64 sm:h-96 bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 rounded-lg flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-green-400/10 to-purple-400/10 animate-pulse" />
      
      <div className="text-center relative z-10">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-blue-400 opacity-20"></div>
        </div>
        <p className="text-gray-700 font-semibold text-lg mb-2">Đang tải bản đồ VietMap...</p>
        <p className="text-sm text-gray-500">Tìm tuyến đường tối ưu</p>
        
        {/* Loading dots */}
        <div className="flex items-center justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
})

interface MapWrapperProps {
  point1?: string
  point2?: string
  vehicle?: string
  onRouteChange?: (point1: string, point2: string, vehicle: string) => void
  onRouteDataChange?: (data: any) => void
  className?: string
  selectedStartAddress?: any
  selectedEndAddress?: any
}

export default function MapWrapper(props: MapWrapperProps) {
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsClient(true)
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    
    return () => clearTimeout(timer)
  }, [])

  if (!isClient) {
    return (
      <div className={`bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 rounded-lg flex items-center justify-center relative overflow-hidden ${props.className || 'h-64 sm:h-96'}`}>
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-green-400/10 to-purple-400/10 animate-pulse" />
        
        <div className="text-center relative z-10">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-blue-400 opacity-20"></div>
          </div>
          <p className="text-gray-700 font-semibold text-lg mb-2">Đang khởi tạo bản đồ...</p>
          <p className="text-sm text-gray-500">Hệ thống chỉ đường thông minh</p>
          
          {/* Loading dots */}
          <div className="flex items-center justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 rounded-lg flex items-center justify-center relative overflow-hidden ${props.className || 'h-64 sm:h-96'}`}>
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-green-400/10 to-purple-400/10 animate-pulse" />
        
        <div className="text-center relative z-10">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-blue-400 opacity-20"></div>
          </div>
          <p className="text-gray-700 font-semibold text-lg mb-2">Đang tải bản đồ...</p>
          
          {/* Loading dots */}
          <div className="flex items-center justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`animate-in slide-in-from-bottom-4 duration-700 ${props.className || 'h-64 sm:h-96'}`}>
      <RealMap {...props} />
    </div>
  )
} 