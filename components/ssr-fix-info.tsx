"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, Code, Server } from "lucide-react"

export default function SSRFixInfo() {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-green-800">
          <CheckCircle className="h-5 w-5" />
          <span>Đã khắc phục lỗi SSR</span>
        </CardTitle>
        <CardDescription className="text-green-700">
          Bản đồ hiện tại hoạt động ổn định trên cả server và client
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-800 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Vấn đề đã gặp</span>
            </h4>
            <div className="text-xs text-green-700 space-y-1">
              <p>• <code className="bg-green-100 px-1 rounded">ReferenceError: window is not defined</code></p>
              <p>• Leaflet library không tương thích với SSR</p>
              <p>• Lỗi xảy ra khi render server-side</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-800 flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Giải pháp đã áp dụng</span>
            </h4>
            <div className="text-xs text-green-700 space-y-1">
              <p>• Dynamic imports với <code className="bg-green-100 px-1 rounded">ssr: false</code></p>
              <p>• Client-side only rendering cho map components</p>
              <p>• Loading states cho trải nghiệm mượt mà</p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-700">Server-side rendering</span>
            </div>
            <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
              Đã khắc phục
            </Badge>
          </div>
        </div>

        <div className="bg-green-100 p-3 rounded-lg">
          <div className="flex items-start space-x-2">
            <Code className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-green-800">
              <p className="font-medium mb-1">Kỹ thuật sử dụng:</p>
              <code className="block bg-green-200 px-2 py-1 rounded text-xs">
                {`const MapWrapper = dynamic(() => import("./real-map"), { ssr: false })`}
              </code>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 