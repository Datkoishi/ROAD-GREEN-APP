"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, Code, Zap } from "lucide-react"

export default function HooksFixInfo() {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-800">
          <CheckCircle className="h-5 w-5" />
          <span>Đã khắc phục lỗi React Hooks</span>
        </CardTitle>
        <CardDescription className="text-blue-700">
          Tuân thủ Rules of Hooks để đảm bảo ứng dụng hoạt động ổn định
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-blue-800 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Vấn đề đã gặp</span>
            </h4>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• <code className="bg-blue-100 px-1 rounded">Rendered more hooks than during the previous render</code></p>
              <p>• Hooks được gọi sau điều kiện return sớm</p>
              <p>• Vi phạm Rules of Hooks của React</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-blue-800 flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Giải pháp đã áp dụng</span>
            </h4>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• Di chuyển tất cả hooks lên đầu component</p>
              <p>• Đảm bảo hooks luôn được gọi theo thứ tự nhất quán</p>
              <p>• Tuân thủ Rules of Hooks nghiêm ngặt</p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-blue-700">React Hooks Rules</span>
            </div>
            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
              Đã tuân thủ
            </Badge>
          </div>
        </div>

        <div className="bg-blue-100 p-3 rounded-lg">
          <div className="flex items-start space-x-2">
            <Code className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <p className="font-medium mb-1">Rules of Hooks đã tuân thủ:</p>
              <ul className="space-y-1 ml-2">
                <li>• Chỉ gọi hooks ở top level của component</li>
                <li>• Không gọi hooks trong loops, conditions, hoặc nested functions</li>
                <li>• Luôn gọi hooks theo cùng thứ tự mỗi lần render</li>
                <li>• Chỉ gọi hooks từ React functions hoặc custom hooks</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-green-100 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div className="text-xs text-green-800">
              <p className="font-medium">✅ Ứng dụng hiện tại hoạt động ổn định</p>
              <p>Không còn lỗi React Hooks và SSR</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 