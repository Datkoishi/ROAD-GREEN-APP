"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search, Globe, Clock, CheckCircle } from "lucide-react"

export default function AddressSearchInfo() {
  return (
    <Card className="border-indigo-200 bg-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-indigo-800">
          <Search className="h-5 w-5" />
          <span>Autocomplete địa chỉ như Google Maps</span>
        </CardTitle>
        <CardDescription className="text-indigo-700">
          Tích hợp OpenStreetMap API thực tế cho tìm kiếm địa chỉ với autocomplete và geocoding
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-indigo-800 flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Tính năng chính</span>
            </h4>
            <div className="text-xs text-indigo-700 space-y-1">
                          <p>• Autocomplete real-time như Google Maps</p>
            <p>• Gợi ý địa chỉ với icon và thông tin chi tiết</p>
            <p>• Hiển thị loại địa điểm (nhà hàng, khách sạn, v.v.)</p>
            <p>• Đánh giá độ nổi bật của địa điểm</p>
            <p>• Debounced search (300ms) cho performance</p>
            <p>• Tự động vẽ đường đi khi chọn đủ 2 địa chỉ</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-indigo-800 flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Cách sử dụng</span>
            </h4>
            <div className="text-xs text-indigo-700 space-y-1">
                          <p>• Nhập địa chỉ → Autocomplete hiện ngay</p>
            <p>• Chọn từ danh sách với icon và thông tin</p>
            <p>• Xem loại địa điểm và độ nổi bật</p>
            <p>• Tự động vẽ đường đi khi chọn đủ 2 địa chỉ</p>
            <p>• Hiển thị marker và route trên bản đồ</p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-indigo-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              <span className="text-xs text-indigo-700">Debounced search (500ms)</span>
            </div>
            <Badge variant="outline" className="text-xs bg-indigo-100 text-indigo-700 border-indigo-300">
              Real-time
            </Badge>
          </div>
        </div>

        <div className="bg-indigo-100 p-3 rounded-lg">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-indigo-800">
              <p className="font-medium mb-1">Ví dụ địa chỉ:</p>
              <ul className="space-y-1 ml-2">
                <li>• "Bến Thành, Quận 1, TP.HCM"</li>
                <li>• "Phú Mỹ Hưng, Quận 7, TP.HCM"</li>
                <li>• "Võ Thị Sáu, Quận 3, TP.HCM"</li>
                <li>• "Thảo Điền, Quận 2, TP.HCM"</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-green-100 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
                      <div className="text-xs text-green-800">
            <p className="font-medium">✅ Autocomplete với dữ liệu thực tế</p>
            <p>Gợi ý địa chỉ thông minh từ OpenStreetMap với thông tin chi tiết</p>
          </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 