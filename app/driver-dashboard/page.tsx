"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DriverDashboard from "@/components/driver-dashboard"
import { Button } from "@/components/ui/button"
import { LogOut, Truck } from "lucide-react"
import Logo from "@/components/logo"

export default function DriverDashboardPage() {
  const [userData, setUserData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken')
    const user = localStorage.getItem('userData')
    
    if (!token || !user) {
      router.push('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(user)
      setUserData(parsedUser)
      
      // Check if user is driver (not manager)
      if (parsedUser.role === 'manager') {
        router.push('/manager-dashboard')
      }
    } catch (error) {
      router.push('/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    router.push('/login')
  }

  const handleGoToMainApp = () => {
    router.push('/dashboard')
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <Logo size="md" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                Road Green - Tài xế
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                Hệ thống giao hàng thông minh
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{userData.full_name}</p>
              <p className="text-xs text-gray-500">Tài xế</p>
            </div>
            <Button
              variant="outline"
              onClick={handleGoToMainApp}
              className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
            >
              <Truck className="h-4 w-4" />
              <span>Vào ứng dụng</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Đăng xuất</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <DriverDashboard />
        </div>
      </main>
    </div>
  )
} 