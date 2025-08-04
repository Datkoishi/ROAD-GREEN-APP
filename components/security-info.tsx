"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Lock, Server, AlertTriangle, CheckCircle } from "lucide-react"

export default function SecurityInfo() {
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-orange-800">
          <Shield className="h-5 w-5" />
          <span>Bảo mật API VietMap</span>
        </CardTitle>
        <CardDescription className="text-orange-700">
          Hướng dẫn sử dụng API an toàn theo tiêu chuẩn VietMap
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-orange-800 flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Đã triển khai</span>
            </h4>
            <ul className="space-y-2 text-sm text-orange-700">
              <li className="flex items-start space-x-2">
                <Server className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>Backend proxy server bảo vệ API key</span>
              </li>
              <li className="flex items-start space-x-2">
                <Lock className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>API key được lưu trong environment variables</span>
              </li>
              <li className="flex items-start space-x-2">
                <Shield className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>Rate limiting và input validation</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-orange-800 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Lưu ý quan trọng</span>
            </h4>
            <ul className="space-y-2 text-sm text-orange-700">
              <li>• Không bao giờ hiển thị API key trên frontend</li>
              <li>• Luôn sử dụng HTTPS cho production</li>
              <li>• Triển khai SSL pinning cho mobile apps</li>
              <li>• Giới hạn quyền truy cập API key</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-4 border-t border-orange-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-orange-600">
              API Key được bảo vệ bởi backend proxy
            </div>
            <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
              Secure
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 