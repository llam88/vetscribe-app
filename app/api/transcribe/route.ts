import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export const runtime = "nodejs"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const audio = form.get("audio") as File | null
    if (!audio) return NextResponse.json({ error: "No audio file uploaded" }, { status: 400 })

    const arrayBuf = await audio.arrayBuffer()
    const buffer = Buffer.from(arrayBuf)

    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: new File([buffer], audio.name || "recording.wav", { type: audio.type || "audio/wav" }),
      response_format: "text",
    })

    const cleanTranscription = (transcription || "").trim()
    
    console.log(`[/api/transcribe] Success: ${cleanTranscription.length} characters generated`)
    
    return NextResponse.json({ 
      transcription: cleanTranscription,
      success: true,
      length: cleanTranscription.length
    })
  } catch (err) {
    console.error("[/api/transcribe] error:", err)
    return NextResponse.json({ 
      error: "Transcription failed", 
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 })
  }
}
