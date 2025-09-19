import { NextRequest } from "next/server"
import PDFDocument from "pdfkit"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const { title = "Note", content = "" } = await req.json()
    
    // Create PDF with embedded fonts to avoid font file issues
    const doc = new PDFDocument({ 
      margin: 50,
      font: 'Helvetica' // Use built-in font
    })
    const chunks: Uint8Array[] = []

    return new Response(
      new ReadableStream({
        start(controller) {
          doc.on("data", (chunk) => {
            chunks.push(chunk)
            controller.enqueue(chunk)
          })
          doc.on("end", () => controller.close())

          doc.fontSize(18).text(title, { underline: true })
          doc.moveDown()
          doc.fontSize(11).text(content, { align: "left" })
          doc.end()
        },
      }),
      {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf"`,
        },
      }
    )
  } catch (error) {
    console.error('PDF export error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate PDF' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
