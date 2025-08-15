"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Truck, 
  Star, 
  MapPin, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  BarChart3,
  Calendar,
  Award,
  Navigation,
  Car,
  Loader2
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

interface CustomerFeedback {
  id: number
  customer_name: string
  driver_name: string
  rating: number
  feedback: string
  delivery_date: string
  order_id: number
}

interface DeliveryStats {
  total_drivers: number
  active_drivers: number
  today_deliveries: number
  total_deliveries: number
  total_distance: number
  average_rating: number
  total_points: number
}

export default function ManagerDashboard() {
  const [loading, setLoading] = useState(true)
  const [driverStats, setDriverStats] = useState<DriverStats[]>([])
  const [customerFeedback, setCustomerFeedback] = useState<CustomerFeedback[]>([])
  const [deliveryStats, setDeliveryStats] = useState<DeliveryStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch driver statistics
      const driversResponse = await fetch('/api/analytics/drivers')
      const driversData = await driversResponse.json()

      // Fetch customer feedback
      const feedbackResponse = await fetch('/api/analytics/feedback')
      const feedbackData = await feedbackResponse.json()

      // Fetch delivery statistics
      const statsResponse = await fetch('/api/analytics/stats')
      const statsData = await statsResponse.json()

      if (driversData.success) {
        setDriverStats(driversData.data)
      }

      if (feedbackData.success) {
        setCustomerFeedback(feedbackData.data)
      }

      if (statsData.success) {
        setDeliveryStats(statsData.data)
      }

    } catch (err) {
      setError('Không thể tải dữ liệu dashboard')
      console.error('Dashboard error:', err)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
      case 'inactive':
        return <Badge variant="outline" className="text-gray-600">Không hoạt động</Badge>
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Tạm khóa</Badge>
      default:
        return <Badge variant="outline">Không xác định</Badge>
    }
  }

  const getRatingStars = (rating: any) => {
    const ratingNumber = parseFloat(String(rating)) || 0
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= ratingNumber ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({ratingNumber.toFixed(1)})</span>
      </div>
    )
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
        <Button onClick={fetchDashboardData} variant="outline">
          Thử lại
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      {deliveryStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng tài xế</p>
                  <p className="text-2xl font-bold text-gray-900">{deliveryStats.total_drivers}</p>
                  <p className="text-xs text-green-600">
                    {deliveryStats.active_drivers} đang hoạt động
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Truck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Chuyến giao hôm nay</p>
                  <p className="text-2xl font-bold text-gray-900">{deliveryStats.today_deliveries}</p>
                  <p className="text-xs text-blue-600">
                    Tổng: {deliveryStats.total_deliveries} chuyến
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng quãng đường</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(deliveryStats.total_distance / 1000).toFixed(1)} km
                  </p>
                  <p className="text-xs text-purple-600">
                    Trung bình: {deliveryStats.total_deliveries > 0 ? 
                      (deliveryStats.total_distance / deliveryStats.total_deliveries).toFixed(1) : 0} km/chuyến
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
                  <p className="text-sm text-gray-600">Đánh giá trung bình</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(parseFloat(String(deliveryStats.average_rating)) || 0).toFixed(1)}
                  </p>
                  <p className="text-xs text-yellow-600">
                    {deliveryStats.total_points} điểm tích lũy
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="drivers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="drivers" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Tài xế</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Phản hồi</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Thống kê</span>
          </TabsTrigger>
        </TabsList>

        {/* Drivers Tab */}
        <TabsContent value="drivers" className="space-y-6">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Quản lý tài xế</span>
              </CardTitle>
              <CardDescription>
                Thống kê chi tiết về tài xế và hiệu suất giao hàng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {driverStats.map((driver) => (
                  <div key={driver.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-600">
                          {driver.full_name.charAt(0)}
                        </span>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{driver.full_name}</h3>
                          {getStatusBadge(driver.status)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center space-x-1">
                            <span className="text-lg">{getVehicleIcon(driver.vehicle_type)}</span>
                            <span>{driver.vehicle_type}</span>
                          </span>
                          <span>📞 {driver.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Hôm nay</p>
                        <p className="font-bold text-green-600">{driver.today_deliveries}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Tổng chuyến</p>
                        <p className="font-bold text-blue-600">{driver.total_deliveries}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Quãng đường</p>
                        <p className="font-bold text-purple-600">
                          {(driver.total_distance / 1000).toFixed(1)} km
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Đánh giá</p>
                        {getRatingStars(driver.rating)}
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Điểm</p>
                        <p className="font-bold text-orange-600">{driver.points}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-6">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <span>Phản hồi khách hàng</span>
              </CardTitle>
              <CardDescription>
                Đánh giá và phản hồi từ khách hàng về dịch vụ giao hàng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerFeedback.map((feedback) => (
                  <div key={feedback.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{feedback.customer_name}</h4>
                          <span className="text-sm text-gray-500">→</span>
                          <span className="font-medium text-blue-600">{feedback.driver_name}</span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <span>📅 {new Date(feedback.delivery_date).toLocaleDateString('vi-VN')}</span>
                          <span>📦 Chuyến #{feedback.order_id}</span>
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
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span>Hiệu suất giao hàng</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tỷ lệ hoàn thành</span>
                    <span className="font-bold text-green-600">98.5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '98.5%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Thời gian trung bình</span>
                    <span className="font-bold text-blue-600">25 phút</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Đánh giá khách hàng</span>
                    <span className="font-bold text-yellow-600">4.8/5.0</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <span>Thống kê theo ngày</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{deliveryStats?.today_deliveries || 0}</p>
                      <p className="text-sm text-gray-600">Chuyến hôm nay</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{deliveryStats?.active_drivers || 0}</p>
                      <p className="text-sm text-gray-600">Tài xế hoạt động</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tổng chuyến giao:</span>
                      <span className="font-medium">{deliveryStats?.total_deliveries || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tổng quãng đường:</span>
                      <span className="font-medium">
                        {deliveryStats ? (deliveryStats.total_distance / 1000).toFixed(1) : 0} km
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Đánh giá trung bình:</span>
                      <span className="font-medium">
                        {(parseFloat(String(deliveryStats?.average_rating)) || 0).toFixed(1)}/5.0
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 