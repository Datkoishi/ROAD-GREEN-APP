"use client"

const API_BASE = "/api/map"

export interface Coordinates {
  lat: number
  lng: number
}

export interface DeliveryOrder {
  id: string
  address: string
  coordinates?: Coordinates
  customerName: string
  phone: string
  items: string
  notes?: string
  priority?: number
}

export interface OptimizedRoute {
  order: DeliveryOrder
  sequence: number
  estimatedTime: number
  distance: number
  directions?: any
}

export interface TrafficReport {
  id: string
  type: "flood" | "traffic"
  location: string
  coordinates: Coordinates
  reporter: string
  timestamp: string
  verified: boolean
  votes: number
  description: string
  severity: "low" | "medium" | "high"
}

export class MapService {
  // Geocoding - Convert address to coordinates
  static async geocodeAddress(address: string) {
    try {
      const response = await fetch(`${API_BASE}/geocode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Geocoding error:", error)
      throw error
    }
  }

  // Reverse Geocoding - Convert coordinates to address
  static async reverseGeocode(lat: number, lng: number) {
    try {
      const response = await fetch(`${API_BASE}/reverse-geocode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lat, lng }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Reverse geocoding error:", error)
      throw error
    }
  }

  // Route Optimization
  static async optimizeRoute(orders: DeliveryOrder[], startLocation?: Coordinates) {
    try {
      const response = await fetch(`${API_BASE}/route-optimization`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orders, startLocation }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Route optimization error:", error)
      throw error
    }
  }

  // Traffic Reports
  static async getTrafficReports(lat?: number, lng?: number, radius?: number) {
    try {
      const params = new URLSearchParams()
      if (lat) params.append("lat", lat.toString())
      if (lng) params.append("lng", lng.toString())
      if (radius) params.append("radius", radius.toString())

      const response = await fetch(`${API_BASE}/traffic-reports?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Get traffic reports error:", error)
      throw error
    }
  }

  static async createTrafficReport(report: {
    type: "flood" | "traffic"
    location: string
    coordinates: Coordinates
    description?: string
    reporter: string
  }) {
    try {
      const response = await fetch(`${API_BASE}/traffic-reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(report),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Create traffic report error:", error)
      throw error
    }
  }

  static async updateTrafficReport(
    reportId: string,
    action: "upvote" | "downvote" | "verify" | "flag_false",
    userId?: string,
  ) {
    try {
      const response = await fetch(`${API_BASE}/traffic-reports`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reportId, action, userId }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Update traffic report error:", error)
      throw error
    }
  }

  // Get current location
  static async getCurrentLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        },
      )
    })
  }

  // Get nearby places
  static async getNearbyPlaces(lat: number, lng: number, type = "gas_station", radius = 1000) {
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        type,
        radius: radius.toString(),
      })

      const response = await fetch(`${API_BASE}/nearby-places?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Get nearby places error:", error)
      throw error
    }
  }
}

// Customer Service
export class CustomerService {
  static async getCustomers(search?: string) {
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)

      const response = await fetch(`/api/customers?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Get customers error:", error)
      throw error
    }
  }

  static async createOrUpdateCustomer(customerData: {
    address: string
    phone: string
    customerName: string
    items?: string
    notes?: string
    coordinates?: Coordinates
  }) {
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Create/update customer error:", error)
      throw error
    }
  }

  static async updateCustomer(
    customerId: string,
    updates: {
      notes?: string
      phone?: string
      customerName?: string
    },
  ) {
    try {
      const response = await fetch("/api/customers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customerId, ...updates }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Update customer error:", error)
      throw error
    }
  }
}
