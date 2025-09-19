import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export const runtime = "nodejs"
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const { transcription, patientInfo, visitType, template } = await req.json()
    if (!transcription) return NextResponse.json({ error: "No transcription provided" }, { status: 400 })

    const guardrails =
      "You are a veterinary scribe. ONLY use information explicitly present in the input. Never invent values. If a section lacks data, write 'Not documented'."

    const signalment = `
Patient: ${patientInfo?.name || "Unknown"}
Species: ${patientInfo?.species || "Unknown"}
Breed: ${patientInfo?.breed || "Unknown"}
Age: ${patientInfo?.age || "Unknown"}
Sex: ${patientInfo?.sex || "Unknown"}
Weight: ${patientInfo?.weight || "Unknown"}
Owner: ${patientInfo?.owner || "Unknown"}
Visit Type: ${visitType || "General"}

Appointment Notes (verbatim transcript):
${transcription}
`.trim()

    const basePrompt = `
Organize the provided appointment notes into strict ${template?.label || "SOAP"} format.

CRITICAL RULES:
- SUBJECTIVE: client-reported history/symptoms only
- OBJECTIVE: exam findings/vitals actually observed
- ASSESSMENT: diagnoses/impressions actually stated
- PLAN: treatments/meds/recommendations actually given
- Do not add clinical knowledge, ranges, or assumptions.
- If missing, write "Not documented".

Input:
${signalment}

Output a complete ${template?.label || "SOAP"} note:
`.trim()

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 1400,
      messages: [
        { role: "system", content: guardrails },
        { role: "user", content: basePrompt },
      ],
    })

    const soap = resp.choices[0]?.message?.content ?? ""
    return NextResponse.json({ note: soap })
  } catch (err) {
    console.error("[/api/generate-soap] error:", err)
    return NextResponse.json({ error: "Note generation failed" }, { status: 500 })
  }
}
