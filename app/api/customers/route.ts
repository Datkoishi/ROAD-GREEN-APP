import { type NextRequest, NextResponse } from "next/server"

interface DeliveryHistory {
  date: string
  items: string
  notes?: string
  orderId: string
}

interface Customer {
  id: string
  address: string
  coordinates?: {
    lat: number
    lng: number
  }
  phone: string
  customerName: string
  deliveryHistory: DeliveryHistory[]
  totalDeliveries: number
  lastDelivery: string
  notes?: string
}

// In-memory storage (in production, use a database)
const customers: Customer[] = [
  {
    id: "1",
    address: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
    coordinates: { lat: 10.7379, lng: 106.7017 },
    phone: "0901234567",
    customerName: "Nguyễn Văn A",
    totalDeliveries: 5,
    lastDelivery: "2024-01-15",
    deliveryHistory: [
      { date: "2024-01-15", items: "iPhone 15 Pro, Ốp lưng", notes: "Giao tại tầng 3", orderId: "ORD001" },
      {
        date: "2024-01-10",
        items: "Tai nghe AirPods",
        notes: "Khách không có nhà, giao cho bảo vệ",
        orderId: "ORD002",
      },
      { date: "2024-01-05", items: "Sạc dự phòng 20000mAh", orderId: "ORD003" },
      { date: "2023-12-28", items: "Cáp sạc Lightning", orderId: "ORD004" },
      { date: "2023-12-20", items: "Ốp lưng iPhone, Kính cường lực", orderId: "ORD005" },
    ],
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const address = searchParams.get("address")
    const phone = searchParams.get("phone")

    let filteredCustomers = customers

    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase()
      filteredCustomers = customers.filter(
        (customer) =>
          customer.address.toLowerCase().includes(searchLower) ||
          customer.customerName.toLowerCase().includes(searchLower) ||
          customer.phone.includes(search),
      )
    }

    // Find by exact address
    if (address) {
      filteredCustomers = customers.filter((customer) => customer.address.toLowerCase().includes(address.toLowerCase()))
    }

    // Find by phone
    if (phone) {
      filteredCustomers = customers.filter((customer) => customer.phone === phone)
    }

    return NextResponse.json({
      success: true,
      customers: filteredCustomers,
      total: filteredCustomers.length,
    })
  } catch (error) {
    console.error("Get customers error:", error)
    return NextResponse.json({ error: "Failed to get customers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { address, phone, customerName, items, notes, coordinates } = await request.json()

    if (!address || !phone || !customerName) {
      return NextResponse.json({ error: "Address, phone, and customer name are required" }, { status: 400 })
    }

    // Check if customer already exists
    const existingCustomer = customers.find(
      (c) => c.phone === phone || c.address.toLowerCase() === address.toLowerCase(),
    )

    const deliveryRecord: DeliveryHistory = {
      date: new Date().toISOString().split("T")[0],
      items: items || "",
      notes: notes || "",
      orderId: `ORD${Date.now()}`,
    }

    if (existingCustomer) {
      // Update existing customer
      existingCustomer.deliveryHistory.unshift(deliveryRecord)
      existingCustomer.totalDeliveries += 1
      existingCustomer.lastDelivery = deliveryRecord.date

      // Update coordinates if provided
      if (coordinates) {
        existingCustomer.coordinates = coordinates
      }

      return NextResponse.json({
        success: true,
        customer: existingCustomer,
        isNewCustomer: false,
      })
    } else {
      // Create new customer
      const newCustomer: Customer = {
        id: Date.now().toString(),
        address,
        phone,
        customerName,
        coordinates,
        totalDeliveries: 1,
        lastDelivery: deliveryRecord.date,
        deliveryHistory: [deliveryRecord],
        notes,
      }

      customers.push(newCustomer)

      return NextResponse.json({
        success: true,
        customer: newCustomer,
        isNewCustomer: true,
      })
    }
  } catch (error) {
    console.error("Create/update customer error:", error)
    return NextResponse.json({ error: "Failed to create/update customer" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { customerId, notes, phone, customerName } = await request.json()

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    const customerIndex = customers.findIndex((c) => c.id === customerId)
    if (customerIndex === -1) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Update customer information
    if (notes !== undefined) customers[customerIndex].notes = notes
    if (phone) customers[customerIndex].phone = phone
    if (customerName) customers[customerIndex].customerName = customerName

    return NextResponse.json({
      success: true,
      customer: customers[customerIndex],
    })
  } catch (error) {
    console.error("Update customer error:", error)
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
  }
}
