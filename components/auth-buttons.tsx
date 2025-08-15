"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { User, UserPlus, LogOut, Settings } from "lucide-react"

interface AuthButtonsProps {
  variant?: "header" | "sidebar"
}

export default function AuthButtons({ variant = "header" }: AuthButtonsProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    // Check if user is logged in by looking for auth token in localStorage
    const authToken = localStorage.getItem('authToken')
    const userDataStr = localStorage.getItem('userData')
    
    if (authToken && userDataStr) {
      try {
        const user = JSON.parse(userDataStr)
        setIsLoggedIn(true)
        setUserData(user)
      } catch (error) {
        console.error('Error parsing user data:', error)
        setIsLoggedIn(false)
        setUserData(null)
      }
    } else {
      setIsLoggedIn(false)
      setUserData(null)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    setIsLoggedIn(false)
    setUserData(null)
    window.location.href = '/'
  }

  const handleLogin = () => {
    window.location.href = '/login'
  }

  const handleRegister = () => {
    window.location.href = '/register'
  }

  if (isLoggedIn && userData) {
    // User is logged in - show user info and logout button
    if (variant === "header") {
      return (
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-full shadow-sm border border-green-200/50">
            <div className="w-6 h-6 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">
                {userData.username ? userData.username.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <span className="text-sm font-medium text-green-800">
              {userData.full_name || userData.username || 'Người dùng'}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            className="hover:bg-red-50 hover:text-red-700 transition-all duration-300"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      )
    } else {
      // Sidebar variant
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-xl shadow-sm border border-green-200/50">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">
                {userData.username ? userData.username.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">
                {userData.full_name || userData.username || 'Người dùng'}
              </p>
              <p className="text-xs text-green-600">
                {userData.role === 'manager' ? 'Quản lý' : 'Tài xế'}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="hover:bg-white/50 rounded-full transition-all duration-300">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLogout}
            className="w-full hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-300"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      )
    }
  } else {
    // User is not logged in - show login/register buttons
    if (variant === "header") {
      return (
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLogin}
            className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-300"
          >
            <User className="h-4 w-4 mr-2" />
            Đăng nhập
          </Button>
          <Button 
            size="sm"
            onClick={handleRegister}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transition-all duration-300"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Đăng ký
          </Button>
        </div>
      )
    } else {
      // Sidebar variant
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-200 rounded-xl shadow-sm">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-lg">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Khách</p>
              <p className="text-xs text-gray-500">Chưa đăng nhập</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLogin}
            className="w-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-300"
          >
            <User className="h-4 w-4 mr-2" />
            Đăng nhập
          </Button>
          <Button 
            size="sm"
            onClick={handleRegister}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transition-all duration-300"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Đăng ký
          </Button>
        </div>
      )
    }
  }
} 