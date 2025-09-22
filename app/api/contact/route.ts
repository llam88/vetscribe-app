import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, practice, subject, message } = await request.json()

    // Log the submission
    console.log('📧 NEW CONTACT SUBMISSION:', {
      name, email, practice, subject, message,
      timestamp: new Date().toISOString()
    })

    // Send email via Resend if API key is available
    if (process.env.RESEND_API_KEY) {
      try {
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

        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'onboarding@resend.dev',
            to: 'hello@swiftvet.app',
            subject: `SwiftVet Contact: ${subject} - ${name}`,
            html: emailHtml,
            reply_to: email
          })
        })

        if (resendResponse.ok) {
          console.log('✅ Contact email sent successfully to hello@swiftvet.app')
        } else {
          const errorData = await resendResponse.text()
          console.log('❌ Resend error:', errorData)
        }
      } catch (emailError) {
        console.log('❌ Email sending failed:', emailError)
      }
    } else {
      console.log('❌ No RESEND_API_KEY found in environment')
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.' 
    })

  } catch (error) {
    console.error('❌ Contact form error:', error)
    return NextResponse.json({ 
      success: true, 
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.' 
    })
  }
}
