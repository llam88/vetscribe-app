import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export const runtime = "nodejs"
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const { transcription } = await req.json()
    if (!transcription) return NextResponse.json({ error: "No transcription provided" }, { status: 400 })

    const prompt = `
Create a short client-friendly visit summary (grade 6 reading level) using ONLY facts present in the transcript below.
- Avoid medical jargon where possible.
- No invented facts or dosing.
- If an item isn't stated, don't add it.

Transcript:
${transcription}

Now write a short, clear summary for the pet owner:
`

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 700,
      messages: [
        { role: "system", content: "You produce factual, readable summaries without adding new information." },
        { role: "user", content: prompt },
      ],
    })

    const summary = resp.choices[0]?.message?.content ?? ""
    return NextResponse.json({ summary })
  } catch (err) {
    console.error("[/api/client-summary] error:", err)
    return NextResponse.json({ error: "Summary generation failed" }, { status: 500 })
  }
}
