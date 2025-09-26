import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, practice, priority, feature, useCase } = await request.json()

    // Log the feature request
    console.log('💡 NEW FEATURE REQUEST:', {
      name, email, practice, priority, feature, useCase,
      timestamp: new Date().toISOString()
    })

    // Send email via Resend if API key is available
    if (process.env.RESEND_API_KEY) {
      try {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #0ea5e9; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h2 style="margin: 0;">💡 New Feature Request</h2>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">SwiftVet Beta Program</p>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px;">
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #1f2937; margin-top: 0;">Beta User Details</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Practice:</strong> ${practice || 'Not provided'}</p>
                <p><strong>Priority:</strong> ${priority}</p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #1f2937; margin-top: 0;">Feature Request</h3>
                <p style="white-space: pre-line; font-weight: 500;">${feature}</p>
              </div>
              
              ${useCase ? `
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #1f2937; margin-top: 0;">Use Case / Workflow</h3>
                <p style="white-space: pre-line;">${useCase}</p>
              </div>
              ` : ''}
              
              <div style="margin-top: 20px; padding: 15px; background: #e0f2fe; border-radius: 8px; font-size: 14px; color: #0369a1;">
                <p style="margin: 0;"><strong>📧 Sent via SwiftVet Feature Request Form</strong></p>
                <p style="margin: 5px 0 0 0;">Time: ${new Date().toLocaleString()}</p>
                <p style="margin: 5px 0 0 0;">Priority: ${priority}</p>
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
            from: 'features@swiftvet.app',
            to: 'hello@swiftvet.app',
            subject: `SwiftVet Feature Request [${priority}]: ${name} - ${practice}`,
            html: emailHtml,
            reply_to: email
          })
        })

        if (resendResponse.ok) {
          console.log('✅ Feature request email sent successfully')
        } else {
          const errorData = await resendResponse.text()
          console.log('❌ Feature request email error:', errorData)
        }
      } catch (emailError) {
        console.log('❌ Feature request email failed:', emailError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Thank you for your feature request! We\'ll review it and get back to you.' 
    })

  } catch (error) {
    console.error('❌ Feature request error:', error)
    return NextResponse.json({ 
      success: true, 
      message: 'Thank you for your feature request! We\'ll review it and get back to you.' 
    })
  }
}
