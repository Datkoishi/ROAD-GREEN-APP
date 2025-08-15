"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  MapPin, 
  Route, 
  Users, 
  AlertTriangle, 
  Star, 
  Truck, 
  Home,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  Clock,
  Navigation,
  Map,
  Maximize2,
  Minimize2,
  Sparkles,
  Target,
  Shield,
  Award
} from "lucide-react"
import RouteOptimizer from "@/components/route-optimizer"
import CustomerManager from "@/components/customer-manager"
import TrafficReporter from "@/components/traffic-reporter"
import MapView from "@/components/map-view"
import VietMapRoute from "@/components/vietmap-route"
import MapWrapper from "@/components/map-wrapper"
import AddressSearch from "@/components/address-search-simple"
import RouteDetails from "@/components/route-details"
import RouteStats from "@/components/route-stats"
import SSRFixInfo from "@/components/ssr-fix-info"
import HooksFixInfo from "@/components/hooks-fix-info"
import AddressSearchInfo from "@/components/address-search-info"
import SecurityInfo from "@/components/security-info"
import EnhancedDashboard from "@/components/enhanced-dashboard"
import QuickStats from "@/components/quick-stats"

import AuthButtons from "@/components/auth-buttons"
import Logo from "@/components/logo"

export default function Dashboard() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mapExpanded, setMapExpanded] = useState(false)
  const [userScore, setUserScore] = useState(1250)
  const [routeParams, setRouteParams] = useState({
    point1: "10.7729,106.6984",
    point2: "10.7884,106.7056",
    vehicle: "car"
  })
  const [routeData, setRouteData] = useState<any>(null)
  const [selectedRoute, setSelectedRoute] = useState(0)
  const [selectedStartAddress, setSelectedStartAddress] = useState<any>(null)
  const [selectedEndAddress, setSelectedEndAddress] = useState<any>(null)

  const navigationItems = [
    {
      id: "dashboard",
      title: "Bản đồ",
      description: "Tìm đường và chỉ đường",
      icon: Map,
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
      gradient: "from-blue-50 to-blue-100",
      active: !activeFeature
    },
    {
      id: "route-optimizer",
      title: "Tối ưu tuyến đường",
      description: "Sắp xếp lộ trình giao hàng",
      icon: Route,
      color: "text-green-600",
      bgColor: "bg-gradient-to-br from-green-500 to-emerald-600",
      gradient: "from-green-50 to-emerald-100",
      active: activeFeature === "route-optimizer"
    },
    {
      id: "customer-manager",
      title: "Quản lý khách hàng",
      description: "Lưu trữ thông tin khách hàng",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-gradient-to-br from-purple-500 to-indigo-600",
      gradient: "from-purple-50 to-indigo-100",
      active: activeFeature === "customer-manager"
    },
    {
      id: "traffic-reporter",
      title: "Báo cáo giao thông",
      description: "Cảnh báo kẹt xe và ngập nước",
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-gradient-to-br from-orange-500 to-red-600",
      gradient: "from-orange-50 to-red-100",
      active: activeFeature === "traffic-reporter"
    },
    {
      id: "analytics",
      title: "Thống kê",
      description: "Phân tích hiệu suất giao hàng",
      icon: BarChart3,
      color: "text-indigo-600",
      bgColor: "bg-gradient-to-br from-indigo-500 to-purple-600",
      gradient: "from-indigo-50 to-purple-100",
      active: activeFeature === "analytics"
    },

  ]

  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl shadow-2xl transform transition-all duration-500 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 border-r border-gray-200/50`}>
      <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
        <Logo size="md" />
                <Button
                  variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden hover:bg-gray-100/50 rounded-full transition-all duration-300"
                >
          <X className="h-4 w-4" />
                </Button>
                </div>

      <nav className="p-4 space-y-2">
        {navigationItems.map((item, index) => {
          const IconComponent = item.icon
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveFeature(item.id === "dashboard" ? null : item.id)
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 ease-out transform hover:scale-105 ${
                item.active
                  ? `${item.gradient} ${item.color} border-l-4 border-l-current shadow-lg`
                  : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 hover:shadow-md'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`p-2 rounded-lg transition-all duration-300 ${item.active ? 'bg-white/20 shadow-md' : 'bg-gray-100'}`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </button>
          )
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/50">
        <AuthButtons variant="sidebar" />
      </div>
    </div>
  )

  const Header = () => (
    <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 lg:border-l lg:border-l-gray-200/50 shadow-sm">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden hover:bg-gray-100/50 rounded-full transition-all duration-300"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {activeFeature && (
            <>
              <Button
                variant="ghost"
                onClick={() => setActiveFeature(null)}
                className="hidden lg:flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 rounded-full px-4 transition-all duration-300"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                <span>Quay lại Bản đồ</span>
              </Button>
              <Separator orientation="vertical" className="h-6" />
            </>
          )}
          
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
              {activeFeature ? navigationItems.find(item => item.id === activeFeature)?.title : 'Bản đồ chỉ đường'}
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              {activeFeature ? navigationItems.find(item => item.id === activeFeature)?.description : 'Tìm tuyến đường tối ưu với hệ thống thông minh'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="relative hover:bg-gray-100/50 rounded-full transition-all duration-300">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></span>
          </Button>
          
          <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 rounded-full shadow-sm border border-yellow-200/50">
            <Award className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-bold text-yellow-800">{userScore}</span>
          </div>

          {/* Auth Buttons */}
          <AuthButtons variant="header" />
        </div>
          </div>
        </header>
  )

  if (activeFeature && activeFeature !== "dashboard") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/30 flex">
        <Sidebar />
        
        <div className="flex-1 flex flex-col lg:ml-0">
          <Header />

          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
          {activeFeature === "route-optimizer" && <RouteOptimizer />}
          {activeFeature === "customer-manager" && <CustomerManager />}
          {activeFeature === "traffic-reporter" && (
            <TrafficReporter userScore={userScore} setUserScore={setUserScore} />
          )}
              {activeFeature === "analytics" && (
                <div className="space-y-6">
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Sparkles className="h-5 w-5 text-indigo-600" />
                        <span>Phân tích hiệu suất</span>
                      </CardTitle>
                      <CardDescription>Thống kê chi tiết hoạt động giao hàng</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">Tính năng đang phát triển...</p>
                    </CardContent>
                  </Card>
                </div>
              )}

            </div>
        </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/30 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <QuickStats userScore={userScore} />

            {/* Main Map Section */}
            <div className={`grid gap-6 ${mapExpanded ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-4'}`}>
              {/* Map - Takes most space */}
              <div className={`${mapExpanded ? 'xl:col-span-1' : 'xl:col-span-3'}`}>
                <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 via-green-50 to-emerald-50 border-b border-gray-200/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2 text-xl">
                        <div className="p-2 bg-gradient-to-br from-blue-500 via-green-600 to-emerald-700 rounded-lg shadow-lg">
                          <Map className="h-5 w-5 text-white" />
        </div>
                        <span className="bg-gradient-to-r from-blue-600 via-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">
                          Bản đồ chỉ đường
                        </span>
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMapExpanded(!mapExpanded)}
                        className="text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-full transition-all duration-300"
                      >
                        {mapExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </Button>
                    </div>
                    <CardDescription className="text-gray-600 font-medium">
                      Từ: {routeParams.point1} → Đến: {routeParams.point2}
                    </CardDescription>
                </CardHeader>
                  <CardContent className="p-0">
            <MapWrapper 
              point1={routeParams.point1}
              point2={routeParams.point2}
              vehicle={routeParams.vehicle}
              selectedStartAddress={selectedStartAddress}
              selectedEndAddress={selectedEndAddress}
              onRouteChange={(point1: string, point2: string, vehicle: string) => {
                setRouteParams({ point1, point2, vehicle })
              }}
              onRouteDataChange={(data: any) => {
                setRouteData(data)
              }}
            />
                  </CardContent>
                </Card>
              </div>

              {/* Controls Sidebar */}
              <div className={`${mapExpanded ? 'xl:col-span-1' : 'xl:col-span-1'} space-y-6`}>
                {/* Address Search */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-b border-gray-200/50">
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <div className="p-2 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-lg shadow-lg">
                        <Search className="h-4 w-4 text-white" />
          </div>
                      <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent font-bold">
                        Tìm đường
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <AddressSearch 
                      onRouteChange={(point1, point2, vehicle) => {
                        setRouteParams({ point1, point2, vehicle })
                      }}
                      onAddressChange={(startAddress, endAddress) => {
                        setSelectedStartAddress(startAddress)
                        setSelectedEndAddress(endAddress)
                      }}
                      compact={true}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Route Details - Show when route data exists */}
            {routeData && !mapExpanded && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            <RouteStats 
              routeData={routeData}
              vehicle={routeParams.vehicle}
            />
            <RouteDetails 
              routeData={routeData}
              selectedRoute={selectedRoute}
              onRouteChange={setSelectedRoute}
              vehicle={routeParams.vehicle}
            />
          </div>
            )}
        
            {/* Info Cards - Only show when not expanded */}
            {!mapExpanded && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          <SSRFixInfo />
          <HooksFixInfo />
          <AddressSearchInfo />
          <SecurityInfo />
              </div>
            )}
        </div>
      </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
