"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import Logo from "@/components/logo"
import Link from "next/link"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    email: "",
    phone: "",
    vehicle_type: "motorbike",
    vehicle_plate: "",
    driver_license: "",
    password: "",
    confirm_password: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validate passwords match
    if (formData.password !== formData.confirm_password) {
      setError("Mật khẩu xác nhận không khớp")
      setLoading(false)
      return
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự")
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      } else {
        setError(data.error || 'Đăng ký thất bại')
      }
    } catch (err) {
      setError('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 flex flex-col">
        {/* Green Header Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
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

        {/* White Success Card */}
        <div className="bg-white rounded-t-3xl flex-1 p-6">
          <div className="max-w-md mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your account has been created successfully. You will be redirected to the login page shortly.
            </p>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 flex flex-col">
      {/* Green Header Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
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

      {/* White Register Card */}
      <div className="bg-white rounded-t-3xl flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign Up</h2>
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link 
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign In
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  placeholder="Enter username"
                  required
                  className="h-12 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500/20 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  placeholder="Enter full name"
                  required
                  className="h-12 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500/20 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Enter email"
                  required
                  className="h-12 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500/20 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  required
                  className="h-12 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500/20 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle_type" className="text-sm font-medium text-gray-700">Vehicle Type</Label>
                <Select value={formData.vehicle_type} onValueChange={(value) => handleChange('vehicle_type', value)}>
                  <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500/20 text-base">
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motorbike">Motorcycle</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle_plate" className="text-sm font-medium text-gray-700">Vehicle Plate</Label>
                <Input
                  id="vehicle_plate"
                  value={formData.vehicle_plate}
                  onChange={(e) => handleChange('vehicle_plate', e.target.value)}
                  placeholder="Enter vehicle plate"
                  className="h-12 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500/20 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="driver_license" className="text-sm font-medium text-gray-700">Driver License</Label>
                <Input
                  id="driver_license"
                  value={formData.driver_license}
                  onChange={(e) => handleChange('driver_license', e.target.value)}
                  placeholder="Enter driver license"
                  className="h-12 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500/20 text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Enter password"
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

              <div className="space-y-2">
                <Label htmlFor="confirm_password" className="text-sm font-medium text-gray-700">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirm_password}
                    onChange={(e) => handleChange('confirm_password', e.target.value)}
                    placeholder="Confirm password"
                    required
                    className="h-12 rounded-xl pr-12 border-gray-200 focus:border-green-500 focus:ring-green-500/20 text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
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
                  <span>Creating account...</span>
                </div>
              ) : (
                "Create Account"
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