import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { to, subject, body, patientName, ownerName } = await req.json()

    // Validate required fields
    if (!to || !subject || !body) {
      return NextResponse.json({ 
        error: 'Missing required fields: to, subject, body' 
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json({ 
        error: 'Invalid email address format' 
      }, { status: 400 })
    }

    // Check if we have email service configured
    if (!process.env.RESEND_API_KEY) {
      // Fallback to mailto if no email service
      const subject_encoded = encodeURIComponent(subject)
      const body_encoded = encodeURIComponent(body)
      const mailtoLink = `mailto:${to}?subject=${subject_encoded}&body=${body_encoded}`
      
      return NextResponse.json({
        success: true,
        method: 'mailto',
        mailtoLink,
        message: 'Email service not configured. Using mailto link instead.'
      })
    }

    // Import Resend dynamically (only if API key exists)
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Send email via Resend
    const emailData = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@vetscribe.app',
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #2563eb; margin: 0;">🐾 VetScribe - ${patientName}'s Visit Summary</h2>
          </div>
          
          <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            ${body.replace(/\n/g, '<br>')}
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px; font-size: 14px; color: #6b7280;">
            <p style="margin: 0;"><strong>📧 Sent via VetScribe</strong></p>
            <p style="margin: 5px 0 0 0;">Professional veterinary practice management system</p>
          </div>
        </div>
      `,
      text: body, // Plain text fallback
    })

    console.log('Email sent successfully:', emailData)

    return NextResponse.json({
      success: true,
      method: 'resend',
      emailId: emailData.data?.id,
      message: `Email sent successfully to ${to}`,
      recipient: to,
      subject: subject
    })

  } catch (error: any) {
    console.error('Email sending error:', error)
    
    // Handle specific Resend errors
    if (error.message?.includes('API key')) {
      return NextResponse.json({ 
        error: 'Email service configuration error',
        details: 'Please check your Resend API key configuration'
      }, { status: 500 })
    }

    if (error.message?.includes('rate limit')) {
      return NextResponse.json({ 
        error: 'Email rate limit exceeded',
        details: 'Please wait a moment before sending another email'
      }, { status: 429 })
    }

    return NextResponse.json({ 
      error: 'Failed to send email',
      details: error.message || 'Unknown error occurred'
    }, { status: 500 })
  }
}
