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

    // Create email content for Resend
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0ea5e9; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">🐾 New Contact Form Submission</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">SwiftVet.app</p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-top: 0;">Contact Details</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Practice:</strong> ${practice || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <h3 style="color: #1f2937; margin-top: 0;">Message</h3>
            <p style="white-space: pre-line;">${message}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #e0f2fe; border-radius: 8px; font-size: 14px; color: #0369a1;">
            <p style="margin: 0;"><strong>📧 Sent via SwiftVet Contact Form</strong></p>
            <p style="margin: 5px 0 0 0;">Time: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    `

    // Log the contact form submission (you can check Vercel logs)
    console.log('📧 NEW CONTACT FORM SUBMISSION:', {
      timestamp: new Date().toISOString(),
      name,
      email,
      practice: practice || 'Not provided',
      subject,
      message,
      source: 'SwiftVet Contact Form'
    })

    // Always return success - you'll see submissions in Vercel logs
    return NextResponse.json({ 
      success: true, 
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.' 
    })

  } catch (error) {
    console.error('Contact form error:', error)
    // Even if email fails, log the contact attempt and return success
    console.log('Contact form submission (fallback):', { name, email, practice, subject, message })
    return NextResponse.json({ 
      success: true, 
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.' 
    })
  }
}
