"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Route, MapPin, Phone, Package, Camera, Navigation } from "lucide-react"
import { MapService, type DeliveryOrder, type OptimizedRoute } from "@/lib/map-service"

export default function EnhancedRouteOptimizer() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([])
  const [currentOrder, setCurrentOrder] = useState<Partial<DeliveryOrder>>({})
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute[]>([])
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false)

  const addOrder = async () => {
    if (currentOrder.address && currentOrder.phone && currentOrder.customerName && currentOrder.items) {
      setIsGeocodingAddress(true)

      try {
        // Geocode the address using VietMap API
        const geocodeResult = await MapService.geocodeAddress(currentOrder.address)

        let coordinates = undefined
        if (geocodeResult.success && geocodeResult.results.length > 0) {
          coordinates = geocodeResult.results[0].coordinates
        }

        const newOrder: DeliveryOrder = {
          id: Date.now().toString(),
          address: currentOrder.address,
          phone: currentOrder.phone,
          customerName: currentOrder.customerName,
          items: currentOrder.items,
          notes: currentOrder.notes,
          coordinates,
        }

        setOrders([...orders, newOrder])
        setCurrentOrder({})
      } catch (error) {
        console.error("Failed to geocode address:", error)
        // Still add the order without coordinates
        const newOrder: DeliveryOrder = {
          id: Date.now().toString(),
          address: currentOrder.address!,
          phone: currentOrder.phone!,
          customerName: currentOrder.customerName!,
          items: currentOrder.items!,
          notes: currentOrder.notes,
        }
        setOrders([...orders, newOrder])
        setCurrentOrder({})
      } finally {
        setIsGeocodingAddress(false)
      }
    }
  }

  const removeOrder = (id: string) => {
    setOrders(orders.filter((order) => order.id !== id))
  }

  const optimizeRoute = async () => {
    setIsOptimizing(true)

    try {
      // Get current location as starting point
      let startLocation = undefined
      try {
        startLocation = await MapService.getCurrentLocation()
      } catch (error) {
        console.log("Could not get current location, using first order as start")
      }

      // Call the route optimization API
      const result = await MapService.optimizeRoute(orders, startLocation)

      if (result.success) {
        setOptimizedRoute(result.optimizedRoute)
      } else {
        throw new Error(result.error || "Failed to optimize route")
      }
    } catch (error) {
      console.error("Route optimization failed:", error)
      alert("Không thể tối ưu hóa lộ trình. Vui lòng thử lại.")
    } finally {
      setIsOptimizing(false)
    }
  }

  const getCurrentLocation = async () => {
    try {
      const location = await MapService.getCurrentLocation()
      const reverseGeocode = await MapService.reverseGeocode(location.lat, location.lng)

      if (reverseGeocode.success && reverseGeocode.result) {
        setCurrentOrder({
          ...currentOrder,
          address: reverseGeocode.result.address,
        })
      }
    } catch (error) {
      console.error("Failed to get current location:", error)
      alert("Không thể lấy vị trí hiện tại. Vui lòng kiểm tra quyền truy cập vị trí.")
    }
  }

  const scanOrderImage = () => {
    alert("Tính năng quét ảnh đơn hàng sẽ được phát triển trong phiên bản tiếp theo")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sắp xếp lộ trình giao hàng</h2>
          <p className="text-gray-600">Nhập thông tin các đơn hàng để tối ưu hóa tuyến đường với VietMap</p>
        </div>
        <Button onClick={scanOrderImage} variant="outline" className="flex items-center space-x-2 bg-transparent">
          <Camera className="h-4 w-4" />
          <span>Quét ảnh đơn hàng</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Thêm đơn hàng</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ giao hàng *</Label>
              <div className="flex space-x-2">
                <Input
                  id="address"
                  placeholder="Nhập địa chỉ giao hàng"
                  value={currentOrder.address || ""}
                  onChange={(e) => setCurrentOrder({ ...currentOrder, address: e.target.value })}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  className="flex items-center space-x-1 bg-transparent"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Vị trí</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại *</Label>
                <Input
                  id="phone"
                  placeholder="0123456789"
                  value={currentOrder.phone || ""}
                  onChange={(e) => setCurrentOrder({ ...currentOrder, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerName">Tên người nhận *</Label>
                <Input
                  id="customerName"
                  placeholder="Nguyễn Văn A"
                  value={currentOrder.customerName || ""}
                  onChange={(e) => setCurrentOrder({ ...currentOrder, customerName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="items">Mặt hàng giao *</Label>
              <Input
                id="items"
                placeholder="Điện thoại iPhone 15, Ốp lưng"
                value={currentOrder.items || ""}
                onChange={(e) => setCurrentOrder({ ...currentOrder, items: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                placeholder="Ghi chú thêm về đơn hàng..."
                value={currentOrder.notes || ""}
                onChange={(e) => setCurrentOrder({ ...currentOrder, notes: e.target.value })}
              />
            </div>

            <Button onClick={addOrder} className="w-full" disabled={isGeocodingAddress}>
              <Plus className="h-4 w-4 mr-2" />
              {isGeocodingAddress ? "Đang xử lý địa chỉ..." : "Thêm đơn hàng"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Danh sách đơn hàng ({orders.length})</span>
              {orders.length > 0 && (
                <Button onClick={optimizeRoute} disabled={isOptimizing} className="flex items-center space-x-2">
                  <Route className="h-4 w-4" />
                  <span>{isOptimizing ? "Đang tối ưu..." : "Tối ưu lộ trình"}</span>
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Chưa có đơn hàng nào</p>
                <p className="text-sm">Thêm đơn hàng để bắt đầu tối ưu lộ trình</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {orders.map((order, index) => (
                  <div key={order.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary">#{index + 1}</Badge>
                          <span className="font-medium">{order.customerName}</span>
                          {order.coordinates && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Đã định vị
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-3 w-3" />
                            <span>{order.address}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-3 w-3" />
                            <span>{order.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Package className="h-3 w-3" />
                            <span>{order.items}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOrder(order.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {optimizedRoute.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-600">
              <Route className="h-5 w-5" />
              <span>Lộ trình đã tối ưu (VietMap)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {optimizedRoute.map((route, index) => (
                <div
                  key={route.order.id}
                  className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold">
                      {route.sequence}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{route.order.customerName}</div>
                    <div className="text-sm text-gray-600">{route.order.address}</div>
                    {route.order.coordinates && (
                      <div className="text-xs text-green-600">
                        Tọa độ: {route.order.coordinates.lat.toFixed(6)}, {route.order.coordinates.lng.toFixed(6)}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-gray-900 font-medium">{route.estimatedTime} phút</div>
                    <div className="text-gray-500">{(route.distance / 1000).toFixed(1)} km</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-800">
                <strong>Tổng thời gian dự kiến:</strong>{" "}
                {optimizedRoute.reduce((sum, route) => sum + route.estimatedTime, 0)} phút
                <br />
                <strong>Tổng quãng đường:</strong>{" "}
                {(optimizedRoute.reduce((sum, route) => sum + route.distance, 0) / 1000).toFixed(1)} km
                <br />
                <strong>Được tối ưu bởi:</strong> VietMap API với dữ liệu giao thông thực tế
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
