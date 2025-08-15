"use client"

import { Truck } from "lucide-react"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
  className?: string
}

export default function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16",
    xl: "w-20 h-20"
  }

  const textSizes = {
    sm: "text-sm",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl"
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${sizeClasses[size]} bg-white rounded-xl shadow-lg overflow-hidden flex items-center justify-center`}>
        <img 
          src="/logo.jpg" 
          alt="Road Green Logo" 
          className="w-full h-full object-cover"
        />
      </div>
      {showText && (
        <div>
          <h1 className={`font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent ${textSizes[size]}`}>
            Road Green
          </h1>
          {size !== "sm" && (
            <p className="text-xs text-gray-500 font-medium">Professional Navigation System</p>
          )}
        </div>
      )}
    </div>
  )
} 