import { NextRequest, NextResponse } from 'next/server'
import { createClientServer } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const sb = await createClientServer()

    // Get current user
    const { data: { user } } = await sb.auth.getUser()
    if (!user) {
      return NextResponse.json({ hasConfig: false, provider: 'none' })
    }

    // Get user's email configuration
    const { data: profile } = await sb
      .from('profiles')
      .select('email_config')
      .eq('id', user.id)
      .single()

    const emailConfig = profile?.email_config || { provider: 'none' }

    return NextResponse.json({
      hasConfig: emailConfig.provider !== 'none',
      provider: emailConfig.provider,
      configured: emailConfig.provider === 'resend' ? !!emailConfig.apiKey : 
                  emailConfig.provider === 'gmail' ? !!(emailConfig.fromEmail && emailConfig.smtpPassword) :
                  emailConfig.provider !== 'none'
    })

  } catch (error) {
    console.error('Check email config error:', error)
    return NextResponse.json({ hasConfig: false, provider: 'none' })
  }
}
