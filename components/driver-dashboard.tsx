"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Truck, 
  Star, 
  Clock, 
  TrendingUp, 
  Award,
  Navigation,
  Car,
  Loader2,
  AlertTriangle,
  MessageSquare,
  Calendar,
  Target,
  Zap,
  Route
} from "lucide-react"

interface DriverStats {
  id: number
  full_name: string
  phone: string
  vehicle_type: string
  today_deliveries: number
  total_deliveries: number
  total_distance: number
  rating: number
  points: number
  status: string
  last_location_lat?: number
  last_location_lng?: number
  last_location_update?: string
}

interface RecentFeedback {
  id: number
  customer_name: string
  rating: number
  feedback: string
  delivery_date: string
  order_id: number
}

export default function DriverDashboard() {
  const [loading, setLoading] = useState(true)
  const [driverStats, setDriverStats] = useState<DriverStats | null>(null)
  const [recentFeedback, setRecentFeedback] = useState<RecentFeedback[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDriverData()
  }, [])

  const fetchDriverData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get user token from localStorage
      const token = localStorage.getItem('authToken')
      if (!token) {
        setError('Chưa đăng nhập')
        return
      }

      // Fetch driver statistics
      const response = await fetch('/api/analytics/driver-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()

      if (data.success) {
        setDriverStats(data.data.driver)
        setRecentFeedback(data.data.recent_feedback || [])
      } else {
        setError(data.error || 'Không thể tải dữ liệu')
      }

    } catch (err) {
      setError('Không thể tải dữ liệu dashboard')
      console.error('Driver dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'car': return '🚗'
      case 'motorcycle': return '🏍️'
      case 'truck': return '🚛'
      default: return '🚗'
    }
  }

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    )
  }

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`
    }
    return `${meters} m`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchDriverData} variant="outline">
          Thử lại
        </Button>
      </div>
    )
  }

  if (!driverStats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Không tìm thấy thông tin tài xế</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 via-green-50 to-emerald-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {driverStats.full_name.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Xin chào, {driverStats.full_name}!</h1>
                <p className="text-gray-600">Chúc bạn một ngày giao hàng hiệu quả</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="flex items-center space-x-1 text-sm text-gray-600">
                    <span className="text-lg">{getVehicleIcon(driverStats.vehicle_type)}</span>
                    <span>{driverStats.vehicle_type}</span>
                  </span>
                  <span className="text-sm text-gray-600">📞 {driverStats.phone}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-green-100 text-green-800 text-sm">
                {driverStats.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Truck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Chuyến hôm nay</p>
                <p className="text-2xl font-bold text-gray-900">{driverStats.today_deliveries}</p>
                <p className="text-xs text-green-600">
                  Tổng: {driverStats.total_deliveries} chuyến
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Quãng đường</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDistance(driverStats.total_distance)}
                </p>
                <p className="text-xs text-blue-600">
                  Trung bình: {driverStats.total_deliveries > 0 ? 
                    formatDistance(driverStats.total_distance / driverStats.total_deliveries) : '0 m'}/chuyến
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đánh giá</p>
                <div className="flex items-center space-x-1">
                  {getRatingStars(driverStats.rating)}
                </div>
                <p className="text-xs text-yellow-600">
                  {driverStats.total_deliveries} chuyến đã giao
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Điểm tích lũy</p>
                <p className="text-2xl font-bold text-gray-900">{driverStats.points}</p>
                <p className="text-xs text-purple-600">
                  Cấp độ: {Math.floor(driverStats.points / 100) + 1}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-orange-600" />
            <span>Truy cập nhanh</span>
          </CardTitle>
          <CardDescription>
            Các tính năng chính để bắt đầu làm việc
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-300 transition-all"
              onClick={() => window.location.href = '/dashboard'}
            >
              <Navigation className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium">Bản đồ chỉ đường</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-green-50 hover:border-green-300 transition-all"
              onClick={() => window.location.href = '/dashboard?feature=route-optimizer'}
            >
              <Route className="h-6 w-6 text-green-600" />
              <span className="text-sm font-medium">Tối ưu tuyến đường</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 hover:border-purple-300 transition-all"
              onClick={() => window.location.href = '/dashboard?feature=vietmap-features'}
            >
              <Target className="h-6 w-6 text-purple-600" />
              <span className="text-sm font-medium">VietMap API</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-orange-50 hover:border-orange-300 transition-all"
              onClick={() => window.location.href = '/dashboard?feature=traffic-reporter'}
            >
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <span className="text-sm font-medium">Báo cáo giao thông</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-indigo-50 hover:border-indigo-300 transition-all"
              onClick={() => window.location.href = '/dashboard?feature=customer-manager'}
            >
              <MessageSquare className="h-6 w-6 text-indigo-600" />
              <span className="text-sm font-medium">Quản lý khách hàng</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-teal-50 hover:border-teal-300 transition-all"
              onClick={() => window.location.href = '/dashboard?feature=analytics'}
            >
              <TrendingUp className="h-6 w-6 text-teal-600" />
              <span className="text-sm font-medium">Thống kê cá nhân</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Feedback */}
      {recentFeedback.length > 0 && (
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <span>Phản hồi gần đây</span>
            </CardTitle>
            <CardDescription>
              Đánh giá từ khách hàng về dịch vụ của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentFeedback.map((feedback) => (
                <div key={feedback.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{feedback.customer_name}</h4>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-600">
                          {new Date(feedback.delivery_date).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-blue-600">Chuyến #{feedback.order_id}</span>
                      </div>
                      
                      {feedback.feedback && (
                        <p className="text-gray-700 text-sm italic">"{feedback.feedback}"</p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getRatingStars(feedback.rating)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Summary */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span>Tóm tắt hiệu suất</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {driverStats.total_deliveries > 0 ? 
                  ((driverStats.today_deliveries / driverStats.total_deliveries) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-sm text-gray-600">Tỷ lệ hoàn thành hôm nay</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {driverStats.total_deliveries > 0 ? 
                  (driverStats.total_distance / driverStats.total_deliveries / 1000).toFixed(1) : 0}
              </div>
              <p className="text-sm text-gray-600">Km trung bình/chuyến</p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {driverStats.rating.toFixed(1)}
              </div>
              <p className="text-sm text-gray-600">Đánh giá trung bình</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 