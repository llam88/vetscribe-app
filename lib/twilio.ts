// Twilio SMS Integration for SwiftVet
// Sends patient summaries and updates via SMS

export interface SMSMessage {
  to: string
  body: string
  patientName?: string
  appointmentId?: string
}

export interface SMSResponse {
  success: boolean
  messageId?: string
  error?: string
  cost?: number
}

// Send SMS via Twilio
export async function sendSMS({ to, body, patientName, appointmentId }: SMSMessage): Promise<SMSResponse> {
  try {
    // Validate phone number format
    const cleanPhone = cleanPhoneNumber(to)
    if (!cleanPhone) {
      return { success: false, error: 'Invalid phone number format' }
    }

    // Prepare SMS content with SwiftVet branding
    const smsBody = `${body}\n\n— ${patientName ? `${patientName}'s vet team` : 'Your veterinary team'}\nReply STOP to opt out`

    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: cleanPhone,
        body: smsBody,
        patientName,
        appointmentId
      })
    })

    const result = await response.json()
    return result

  } catch (error) {
    console.error('SMS sending error:', error)
    return { success: false, error: 'Failed to send SMS' }
  }
}

// Clean and validate phone number
export function cleanPhoneNumber(phone: string): string | null {
  if (!phone) return null
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // Handle US numbers
  if (digits.length === 10) {
    return `+1${digits}` // Add US country code
  }
  
  // Handle international numbers with country code
  if (digits.length >= 11 && digits.length <= 15) {
    return `+${digits}`
  }
  
  return null // Invalid format
}

// Format phone number for display
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    const number = cleaned.slice(1)
    return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`
  }
  
  return phone // Return original if can't format
}

// Generate SMS-appropriate patient summary
export function generateSMSSummary(soapNote: string, patientName: string): string {
  // Keep SMS under 160 characters for single message
  const summary = `${patientName}'s visit summary: ${soapNote.substring(0, 120)}...`
  
  // Common SMS templates
  const templates = {
    wellness: `${patientName} had a great checkup today! Everything looks healthy. Next visit in 1 year.`,
    surgery: `${patientName}'s surgery completed successfully. Recovery instructions sent via email. Call with any concerns.`,
    dental: `${patientName}'s dental cleaning completed. Teeth look great! Monitor eating for 24 hours.`,
    sick: `${patientName} was examined today. Treatment plan started. Monitor closely and follow medication instructions.`,
    emergency: `${patientName} received emergency care. Condition stable. Follow-up in 2-3 days or sooner if symptoms worsen.`
  }
  
  // Auto-detect visit type and use appropriate template
  const lowerSoap = soapNote.toLowerCase()
  
  if (lowerSoap.includes('surgery') || lowerSoap.includes('surgical')) {
    return templates.surgery
  }
  if (lowerSoap.includes('dental') || lowerSoap.includes('cleaning')) {
    return templates.dental
  }
  if (lowerSoap.includes('wellness') || lowerSoap.includes('annual')) {
    return templates.wellness
  }
  if (lowerSoap.includes('emergency') || lowerSoap.includes('urgent')) {
    return templates.emergency
  }
  
  return templates.sick // Default
}
