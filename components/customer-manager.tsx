"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Phone, Package, Clock, User } from "lucide-react"

interface CustomerHistory {
  id: string
  address: string
  phone: string
  customerName: string
  deliveryHistory: {
    date: string
    items: string
    notes?: string
  }[]
  totalDeliveries: number
}

export default function CustomerManager() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerHistory | null>(null)

  // Mock customer data
  const customers: CustomerHistory[] = [
    {
      id: "1",
      address: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
      phone: "0901234567",
      customerName: "Nguyễn Văn A",
      totalDeliveries: 5,
      deliveryHistory: [
        { date: "2024-01-15", items: "iPhone 15 Pro, Ốp lưng", notes: "Giao tại tầng 3" },
        { date: "2024-01-10", items: "Tai nghe AirPods", notes: "Khách không có nhà, giao cho bảo vệ" },
        { date: "2024-01-05", items: "Sạc dự phòng 20000mAh" },
        { date: "2023-12-28", items: "Cáp sạc Lightning" },
        { date: "2023-12-20", items: "Ốp lưng iPhone, Kính cường lực" },
      ],
    },
    {
      id: "2",
      address: "456 Lê Văn Việt, Quận 9, TP.HCM",
      phone: "0912345678",
      customerName: "Trần Thị B",
      totalDeliveries: 3,
      deliveryHistory: [
        { date: "2024-01-12", items: "Laptop Dell XPS 13", notes: "Giao buổi chiều sau 2h" },
        { date: "2024-01-08", items: "Chuột không dây Logitech" },
        { date: "2024-01-03", items: "Bàn phím cơ Keychron K2" },
      ],
    },
    {
      id: "3",
      address: "789 Võ Văn Tần, Quận 3, TP.HCM",
      phone: "0923456789",
      customerName: "Lê Văn C",
      totalDeliveries: 8,
      deliveryHistory: [
        { date: "2024-01-14", items: "Samsung Galaxy S24 Ultra", notes: "Khách yêu cầu kiểm tra máy trước khi nhận" },
        { date: "2024-01-11", items: "Ốp lưng Samsung, Miếng dán màn hình" },
        { date: "2024-01-07", items: "Tai nghe Samsung Galaxy Buds" },
        { date: "2024-01-02", items: "Sạc nhanh 65W" },
      ],
    },
  ]

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm),
  )

  const callCustomer = (phone: string) => {
    window.open(`tel:${phone}`, "_self")
  }

  const copyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone)
    alert("Đã sao chép số điện thoại")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Quản lý thông tin khách hàng</h2>
        <p className="text-gray-600">Xem lịch sử giao hàng và thông tin khách hàng đã từng giao</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Tìm kiếm khách hàng</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm theo địa chỉ, tên khách hàng hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Danh sách khách hàng ({filteredCustomers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedCustomer?.id === customer.id ? "bg-blue-50 border-blue-200" : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{customer.customerName}</span>
                        <Badge variant="secondary">{customer.totalDeliveries} lần giao</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-3 w-3" />
                          <span>{customer.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-3 w-3" />
                          <span>{customer.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chi tiết khách hàng</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCustomer ? (
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg">{selectedCustomer.customerName}</h3>
                  <div className="space-y-2 mt-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedCustomer.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => callCustomer(selectedCustomer.phone)}
                      className="flex items-center space-x-1"
                    >
                      <Phone className="h-3 w-3" />
                      <span>Gọi</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyPhone(selectedCustomer.phone)}
                      className="flex items-center space-x-1"
                    >
                      <span>Sao chép SĐT</span>
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Lịch sử giao hàng ({selectedCustomer.totalDeliveries} lần)</span>
                  </h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedCustomer.deliveryHistory.map((delivery, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-white">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-blue-500" />
                            <span className="font-medium text-sm">{delivery.date}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          <strong>Sản phẩm:</strong> {delivery.items}
                        </div>
                        {delivery.notes && (
                          <div className="text-sm text-gray-500">
                            <strong>Ghi chú:</strong> {delivery.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Chọn khách hàng để xem chi tiết</p>
                <p className="text-sm">Thông tin và lịch sử giao hàng sẽ hiển thị ở đây</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
