import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { dataTypes, format, dateRange } = await request.json()

    // Mock data for demonstration
    const mockData = {
      patients: [
        {
          id: 1,
          name: "Buddy",
          species: "Dog",
          breed: "Golden Retriever",
          owner: "John Smith",
          created: "2024-01-15",
        },
        {
          id: 2,
          name: "Luna",
          species: "Cat",
          breed: "Domestic Shorthair",
          owner: "Sarah Johnson",
          created: "2024-01-15",
        },
      ],
      appointments: [
        {
          id: 1,
          patientId: 1,
          date: "2024-01-15",
          type: "Wellness Exam",
          status: "completed",
        },
        {
          id: 2,
          patientId: 2,
          date: "2024-01-15",
          type: "Vaccination",
          status: "completed",
        },
      ],
      notes: [
        {
          id: 1,
          patientId: 1,
          appointmentId: 1,
          content: "SOAP notes content...",
          created: "2024-01-15",
        },
      ],
    }

    // Filter data based on selected types
    const filteredData: any = {}
    dataTypes.forEach((type: string) => {
      if (mockData[type as keyof typeof mockData]) {
        filteredData[type] = mockData[type as keyof typeof mockData]
      }
    })

    // Apply date range filter if specified
    if (dateRange.from && dateRange.to) {
      Object.keys(filteredData).forEach((type) => {
        filteredData[type] = filteredData[type].filter((item: any) => {
          const itemDate = item.created || item.date
          return itemDate >= dateRange.from && itemDate <= dateRange.to
        })
      })
    }

    let responseData: string | Buffer
    let contentType: string
    let filename: string

    switch (format) {
      case "json":
        responseData = JSON.stringify(filteredData, null, 2)
        contentType = "application/json"
        filename = "export.json"
        break
      case "csv":
        // Convert to CSV format (simplified)
        const csvData = Object.entries(filteredData)
          .map(([type, records]) => {
            if (!Array.isArray(records) || records.length === 0) return ""
            const headers = Object.keys(records[0]).join(",")
            const rows = records.map((record: any) => Object.values(record).join(",")).join("\n")
            return `${type.toUpperCase()}\n${headers}\n${rows}\n\n`
          })
          .join("")
        responseData = csvData
        contentType = "text/csv"
        filename = "export.csv"
        break
      default:
        responseData = JSON.stringify(filteredData, null, 2)
        contentType = "application/json"
        filename = "export.json"
    }

    return new NextResponse(responseData, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
