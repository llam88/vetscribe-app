import { NextRequest, NextResponse } from 'next/server'
import { createClientServer } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { to, body, patientName, appointmentId } = await request.json()

    // Validate required fields
    if (!to || !body) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      )
    }

    // Get current user
    const sb = await createClientServer()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Clean phone number (remove formatting, add country code if needed)
    const cleanPhone = to.replace(/\D/g, '')
    let formattedPhone = ''
    
    if (cleanPhone.length === 10) {
      formattedPhone = `+1${cleanPhone}` // US number
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
      formattedPhone = `+${cleanPhone}` // US with country code
    } else {
      return NextResponse.json(
        { error: 'Invalid phone number format. Please use US format: (555) 123-4567' },
        { status: 400 }
      )
    }

    // Prepare SMS content with professional formatting
    const smsBody = `${body}\n\n— ${patientName ? `${patientName}'s vet team` : 'Your veterinary team'}\nReply STOP to opt out`

    // Send SMS via Twilio
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const twilioResponse = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${Buffer.from(
                `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
              ).toString('base64')}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              From: process.env.TWILIO_PHONE_NUMBER || '',
              To: formattedPhone,
              Body: smsBody
            })
          }
        )

        const result = await twilioResponse.json()

        if (twilioResponse.ok) {
          console.log('✅ SMS sent successfully:', result.sid)
          
          // Log SMS in database for tracking
          try {
            await sb.from('sms_logs').insert({
              user_id: user.id,
              appointment_id: appointmentId,
              patient_name: patientName,
              phone_number: formattedPhone,
              message_body: smsBody,
              twilio_sid: result.sid,
              status: 'sent',
              cost: parseFloat(result.price || '0.0075')
            })
          } catch (logError) {
            console.warn('Failed to log SMS:', logError)
          }

          return NextResponse.json({
            success: true,
            messageId: result.sid,
            message: 'SMS sent successfully!',
            cost: result.price
          })
        } else {
          console.error('Twilio error:', result)
          return NextResponse.json(
            { error: result.message || 'Failed to send SMS' },
            { status: 400 }
          )
        }
      } catch (twilioError) {
        console.error('Twilio API error:', twilioError)
        return NextResponse.json(
          { error: 'SMS service temporarily unavailable' },
          { status: 500 }
        )
      }
    } else {
      // Twilio not configured - log the attempt
      console.log('📱 SMS would be sent:', { to: formattedPhone, body: smsBody, patientName })
      return NextResponse.json({
        success: true,
        message: 'SMS feature not configured yet - check Vercel logs for message content'
      })
    }

  } catch (error) {
    console.error('SMS API error:', error)
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    )
  }
}
