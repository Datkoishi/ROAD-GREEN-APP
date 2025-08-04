import { NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    // Test basic connection
    const testQuery = "SELECT 1 as test"
    const result = await Database.query(testQuery)
    
    // Test if tables exist
    const tablesQuery = `
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'road_green'
    `
    const tables = await Database.query(tablesQuery)
    
    // Test users table
    const usersCountQuery = "SELECT COUNT(*) as count FROM users"
    const usersCount = await Database.query(usersCountQuery)
    
    // Test customers table
    const customersCountQuery = "SELECT COUNT(*) as count FROM customers"
    const customersCount = await Database.query(customersCountQuery)
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: {
        connection: "OK",
        testResult: result[0],
        tables: tables.map((t: any) => t.TABLE_NAME),
        usersCount: usersCount[0].count,
        customersCount: customersCount[0].count
      }
    })
  } catch (error) {
    console.error("Database connection test failed:", error)
    return NextResponse.json({
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 