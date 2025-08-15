"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react"
import Logo from "@/components/logo"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        // Store auth token and user data
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('userData', JSON.stringify(data.user))
        
        // Redirect based on role
        if (data.user.role === 'manager') {
          window.location.href = '/manager-dashboard'
        } else {
          window.location.href = '/driver-dashboard'
        }
      } else {
        setError(data.error || 'Đăng nhập thất bại')
      }
    } catch (err) {
      setError('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 flex flex-col">
      {/* Green Header Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {/* Logo */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 mx-auto">
            <img 
              src="/logo.jpg" 
              alt="Road Green Logo" 
              className="w-16 h-16 rounded-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold text-white">ROAD GREEN</h1>
          <p className="text-green-100 text-sm mt-1">Professional Navigation System</p>
        </div>
      </div>

      {/* White Login Card */}
      <div className="bg-white rounded-t-3xl flex-1 p-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Login</h2>
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link 
                href="/register"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign Up
              </Link>
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="RoadGreen@gmail.com"
                required
                className="h-12 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500/20 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="h-12 rounded-xl pr-12 border-gray-200 focus:border-green-500 focus:ring-green-500/20 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <Label htmlFor="remember" className="text-sm text-gray-600">Remember me</Label>
              </div>
              <Link 
                href="#"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 text-base"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Logging in...</span>
                </div>
              ) : (
                "Log In"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                type="button"
                variant="outline"
                className="w-full h-12 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl text-base font-medium"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">G</div>
                  <span>Continue with Google</span>
                </div>
              </Button>

              <Button 
                type="button"
                variant="outline"
                className="w-full h-12 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl text-base font-medium"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">f</div>
                  <span>Continue with Facebook</span>
                </div>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 