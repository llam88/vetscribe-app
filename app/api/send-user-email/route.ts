import { NextRequest, NextResponse } from 'next/server'
import { createClientServer } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const { to, subject, body, patientName, ownerName } = await req.json()
    const sb = await createClientServer()

    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'Missing required email fields' }, { status: 400 })
    }

    // Get current user
    const { data: { user } } = await sb.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user's email configuration
    const { data: profile } = await sb
      .from('profiles')
      .select('email_config')
      .eq('id', user.id)
      .single()

    const emailConfig = profile?.email_config

    // Check if user has email config, otherwise use default behavior
    if (!emailConfig || emailConfig.provider === 'none') {
      // Fallback to mailto
      const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      return NextResponse.json({
        success: true,
        message: 'No email service configured. Opening default email client.',
        method: 'mailto',
        mailtoLink
      })
    }

    // If user has Resend configured, use their API key
    if (emailConfig.provider === 'resend' && emailConfig.apiKey) {
      try {
        // Use Resend directly with user's API key
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${emailConfig.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: emailConfig.fromEmail || 'onboarding@resend.dev',
            to: to,
            subject: subject,
            html: `<p>Dear ${ownerName || to.split('@')[0]},</p><br/>
                   <p>${body.replace(/\n/g, '<br/>')}</p><br/>
                   <p>Best regards,</p>
                   <p>Your Veterinary Team</p>`,
            text: body
          })
        })

        if (!resendResponse.ok) {
          const errorData = await resendResponse.json()
          throw new Error(errorData.message || 'Resend API error')
        }

        const resendData = await resendResponse.json()
        
        return NextResponse.json({
          success: true,
          message: 'Email sent successfully via your Resend account!',
          method: 'resend',
          messageId: resendData.id
        })
      } catch (resendError: any) {
        console.error('Resend API error:', resendError)
        return NextResponse.json({
          success: false,
          error: `Resend error: ${resendError.message}`
        }, { status: 500 })
      }
    }

    // For other providers, fall back to mailto for now
    const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    return NextResponse.json({
      success: true,
      message: 'Email provider not fully implemented yet. Opening default email client.',
      method: 'mailto',
      mailtoLink,
      userEmailConfig: emailConfig.provider
    })

  } catch (error) {
    console.error('API send-user-email error:', error)
    return NextResponse.json({ error: 'Failed to send email', success: false }, { status: 500 })
  }
}