"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Truck, MapPin, Clock, Star, TrendingUp, Award, Target, Zap } from "lucide-react"

interface QuickStatsProps {
  userScore: number
}

export default function QuickStats({ userScore }: QuickStatsProps) {
  const stats = [
    {
      title: "Đơn hàng",
      value: "12",
      change: "+2",
      changeType: "positive",
      icon: Truck,
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700",
      gradient: "from-blue-50 via-blue-100 to-indigo-50",
      description: "Đơn hàng đã giao hôm nay"
    },

    {
      title: "Thời gian",
      value: "6.5h",
      change: "-0.5h",
      changeType: "positive",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-gradient-to-br from-orange-500 via-red-600 to-pink-700",
      gradient: "from-orange-50 via-red-100 to-pink-50",
      description: "Thời gian giao hàng trung bình"
    },
    {
      title: "Điểm",
      value: userScore.toString(),
      change: "+50",
      changeType: "positive",
      icon: Award,
      color: "text-yellow-600",
      bgColor: "bg-gradient-to-br from-yellow-500 via-orange-600 to-red-700",
      gradient: "from-yellow-50 via-orange-100 to-red-50",
      description: "Điểm tích lũy hiện tại"
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon
        return (
          <Card 
            key={index} 
            className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 ease-out transform hover:scale-105 group overflow-hidden relative"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            {/* Background gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            {/* Animated border */}
            <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-gray-200/50 transition-all duration-500" />
            
            {/* Content */}
            <CardContent className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${stat.bgColor} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-xs font-bold ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className={`h-3 w-3 ${stat.changeType === 'negative' ? 'rotate-180' : ''}`} />
                  <span>{stat.change}</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1 group-hover:text-gray-700 transition-colors">
                  {stat.title}
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                  {stat.description}
                </p>
              </div>

              {/* Progress indicator */}
              <div className="mt-3 w-full bg-gray-200 rounded-full h-1 group-hover:h-1.5 transition-all duration-300">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    stat.changeType === 'positive' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-pink-600'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(20, 60 + Math.random() * 40))}%` }}
                />
              </div>
            </CardContent>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Card>
        )
      })}
    </div>
  )
} 