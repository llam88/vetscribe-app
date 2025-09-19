import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
  }

  try {
    const { patientName, ownerName, appointmentType, visitDate, transcription, soapNote } = await req.json()

    const emailPrompt = `
Create a professional, warm email to ${ownerName} about ${patientName}'s veterinary visit.

CRITICAL RULES:
- ONLY include information explicitly mentioned in the appointment notes below
- DO NOT add treatments, medications, or recommendations not stated
- DO NOT infer medical advice beyond what was discussed
- If specific treatments weren't mentioned, write "as discussed during the visit"
- Be warm and professional but stick strictly to documented facts
- Include a clear subject line

Patient: ${patientName}
Owner: ${ownerName}
Visit Type: ${appointmentType}
Date: ${visitDate}

Appointment Information:
${transcription || soapNote || 'No detailed notes available'}

Create a professional email using ONLY the information provided above.
Format as:

Subject: [appropriate subject line]

Dear ${ownerName},

[email content]

Best regards,
[Your Veterinary Team signature]
`

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are writing a follow-up email for a veterinarian. Use ONLY information explicitly stated in the appointment notes. Never add medical recommendations not mentioned in the original notes. Be professional, warm, and caring while remaining factual."
        },
        {
          role: "user",
          content: emailPrompt
        }
      ],
      temperature: 0.1, // Lower temperature for more factual responses
      max_tokens: 800
    })

    const emailContent = response.choices[0]?.message?.content || ''

    return NextResponse.json({ 
      email: emailContent,
      success: true 
    })

  } catch (error) {
    console.error('Error generating client email:', error)
    return NextResponse.json(
      { error: 'Failed to generate client email' },
      { status: 500 }
    )
  }
}
