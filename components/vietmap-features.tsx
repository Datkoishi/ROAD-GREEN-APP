"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Search, 
  Route, 
  Car, 
  Clock, 
  Navigation, 
  Target, 
  Zap,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react"

// Import các component con
import GeocodingFeature from "./features/geocoding-feature"
import ReverseGeocodingFeature from "./features/reverse-geocoding-feature"
import AutocompleteFeature from "./features/autocomplete-feature"
import MatrixFeature from "./features/matrix-feature"
import TSPFeature from "./features/tsp-feature"
import VRPFeature from "./features/vrp-feature"
import IsochroneFeature from "./features/isochrone-feature"

export default function VietMapFeatures() {
  const [activeTab, setActiveTab] = useState("geocoding")

  const features = [
    {
      id: "geocoding",
      title: "Geocoding",
      description: "Tìm kiếm vị trí từ địa chỉ",
      icon: Search,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      component: GeocodingFeature
    },
    {
      id: "reverse-geocoding",
      title: "Reverse Geocoding",
      description: "Tìm địa chỉ từ tọa độ",
      icon: MapPin,
      color: "text-green-600",
      bgColor: "bg-green-50",
      component: ReverseGeocodingFeature
    },
    {
      id: "autocomplete",
      title: "Auto Complete",
      description: "Tìm kiếm nhanh theo từ khóa",
      icon: Zap,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      component: AutocompleteFeature
    },
    {
      id: "matrix",
      title: "Matrix",
      description: "Ma trận thời gian và khoảng cách",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      component: MatrixFeature
    },
    {
      id: "tsp",
      title: "TSP",
      description: "Tối ưu hóa quãng đường cho 1 phương tiện",
      icon: Route,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      component: TSPFeature
    },
    {
      id: "vrp",
      title: "VRP",
      description: "Tối ưu hóa quãng đường cho nhiều phương tiện",
      icon: Car,
      color: "text-red-600",
      bgColor: "bg-red-50",
      component: VRPFeature
    },
    {
      id: "isochrone",
      title: "Isochrone",
      description: "Vùng ranh giới có thể tiếp cận",
      icon: Target,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      component: IsochroneFeature
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
          VietMap API Features
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Khám phá tất cả các tính năng mạnh mẽ của VietMap API để tối ưu hóa hệ thống giao hàng thông minh
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {features.map((feature) => {
          const IconComponent = feature.icon
          return (
            <Card 
              key={feature.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-0 shadow-md ${feature.bgColor}`}
              onClick={() => setActiveTab(feature.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${feature.color} bg-white shadow-sm`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                  {activeTab === feature.id && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 via-blue-50 to-green-50 border-b border-gray-200/50">
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 via-green-600 to-purple-700 rounded-lg shadow-lg">
              <Navigation className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent font-bold">
              {features.find(f => f.id === activeTab)?.title}
            </span>
          </CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            {features.find(f => f.id === activeTab)?.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7 mb-6">
              {features.map((feature) => (
                <TabsTrigger 
                  key={feature.id} 
                  value={feature.id}
                  className="text-xs"
                >
                  {feature.title}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {features.map((feature) => {
              const FeatureComponent = feature.component
              return (
                <TabsContent key={feature.id} value={feature.id} className="space-y-4">
                  <FeatureComponent />
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* API Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">API Status</p>
                <p className="text-sm text-green-600">Tất cả endpoints hoạt động</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-800">Rate Limits</p>
                <p className="text-sm text-blue-600">Được cấu hình tối ưu</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-semibold text-purple-800">Features</p>
                <p className="text-sm text-purple-600">{features.length} tính năng có sẵn</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 