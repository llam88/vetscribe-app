import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, practice, subject, message } = await request.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create email content
    const emailContent = `
New Contact Form Submission from SwiftVet.app

Name: ${name}
Email: ${email}
Practice: ${practice || 'Not provided'}
Subject: ${subject}

Message:
${message}

---
Sent from SwiftVet Contact Form
Time: ${new Date().toISOString()}
    `.trim()

    // For now, we'll use a simple approach - you can integrate with your email service later
    // This could be sent via Resend, SendGrid, or your Zoho email API
    
    // Simple success response for now
    return NextResponse.json({ 
      success: true, 
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.' 
    })

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}
