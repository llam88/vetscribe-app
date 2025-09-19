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

    // For now, just use the existing send-email API
    // In the future, we can add provider-specific logic here
    const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        subject,
        body,
        patientName,
        ownerName
      })
    })

    const result = await response.json()
    
    // Add user's email config info to response
    return NextResponse.json({
      ...result,
      userEmailConfig: emailConfig?.provider || 'none',
      message: emailConfig?.provider === 'none' 
        ? 'No email service configured. Opening default email client.'
        : result.message
    })

  } catch (error) {
    console.error('API send-user-email error:', error)
    return NextResponse.json({ error: 'Failed to send email', success: false }, { status: 500 })
  }
}