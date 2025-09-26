"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Smartphone, Send, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"
import { generateSMSSummary, formatPhoneNumber, cleanPhoneNumber } from "@/lib/twilio"

interface SMSComposerProps {
  patientName: string
  ownerName: string
  ownerPhone?: string
  visitType?: string
  visitDate?: string
  soapNotes?: string
  onSend?: (phoneNumber: string, message: string) => void
}

export function SMSComposer({
  patientName,
  ownerName,
  ownerPhone = "",
  visitType,
  visitDate,
  soapNotes,
  onSend
}: SMSComposerProps) {
  const [phoneNumber, setPhoneNumber] = useState(ownerPhone)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{type: 'success' | 'error', message: string} | null>(null)

  // Generate SMS from SOAP notes
  const generateSMS = () => {
    if (soapNotes) {
      const autoMessage = generateSMSSummary(soapNotes, patientName)
      setMessage(autoMessage)
    }
  }

  // Send SMS
  const handleSend = async () => {
    if (!phoneNumber || !message) {
      setResult({ type: 'error', message: 'Phone number and message are required' })
      return
    }

    const cleanPhone = cleanPhoneNumber(phoneNumber)
    if (!cleanPhone) {
      setResult({ type: 'error', message: 'Invalid phone number format' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: cleanPhone,
          body: message,
          patientName,
          appointmentId: visitDate // Use visit date as identifier
        })
      })

      const data = await response.json()

      if (data.success) {
        setResult({ type: 'success', message: `SMS sent successfully to ${formatPhoneNumber(phoneNumber)}!` })
        if (onSend) {
          onSend(phoneNumber, message)
        }
      } else {
        setResult({ type: 'error', message: data.error || 'Failed to send SMS' })
      }
    } catch (error) {
      setResult({ type: 'error', message: 'Failed to send SMS. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const messageLength = message.length
  const isLongMessage = messageLength > 160

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          SMS to Pet Owner
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            High Open Rate
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Send instant updates to {ownerName} about {patientName}'s visit
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phone Number Input */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-2">
            Owner Phone Number *
          </label>
          <Input
            id="phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="(555) 123-4567"
            className="font-mono"
          />
          {phoneNumber && cleanPhoneNumber(phoneNumber) && (
            <p className="text-xs text-muted-foreground mt-1">
              Will send to: {formatPhoneNumber(phoneNumber)}
            </p>
          )}
        </div>

        {/* Message Composer */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message *
            </label>
            <div className="flex items-center gap-2">
              <Badge variant={isLongMessage ? "destructive" : "secondary"} className="text-xs">
                {messageLength}/160 chars
              </Badge>
              {soapNotes && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateSMS}
                  className="text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Generate from SOAP
                </Button>
              )}
            </div>
          </div>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hi! Buddy's checkup went great today. Everything looks healthy. His next visit should be in 1 year."
            rows={4}
            className="resize-none"
          />
          {isLongMessage && (
            <p className="text-xs text-orange-600 mt-1">
              ⚠️ Message over 160 characters may be sent as multiple SMS (additional cost)
            </p>
          )}
        </div>

        {/* SMS Templates */}
        <div>
          <p className="text-sm font-medium mb-2">Quick Templates:</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMessage(`${patientName}'s checkup completed. Everything looks great! Follow-up in 1 year.`)}
            >
              Wellness
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMessage(`${patientName}'s surgery completed successfully. Recovery going well. Monitor eating for 24 hours.`)}
            >
              Surgery
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMessage(`${patientName} was seen today. Treatment started. Please follow medication instructions carefully.`)}
            >
              Treatment
            </Button>
          </div>
        </div>

        {/* Send Button */}
        <div className="flex gap-2">
          <Button
            onClick={handleSend}
            disabled={loading || !phoneNumber || !message}
            className="bg-green-600 hover:bg-green-700 flex-1"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sending SMS...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send SMS ({isLongMessage ? 'Multiple' : 'Single'} Message)
              </>
            )}
          </Button>
        </div>

        {/* Result Display */}
        {result && (
          <Alert className={result.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            {result.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={result.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {result.message}
            </AlertDescription>
          </Alert>
        )}

        {/* SMS Info */}
        <div className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded p-3">
          <p className="font-medium text-blue-900 mb-1">📱 SMS Best Practices:</p>
          <ul className="space-y-1 text-blue-700">
            <li>• Keep messages under 160 characters when possible</li>
            <li>• Include patient name and your practice identification</li>
            <li>• Owners can reply STOP to opt out</li>
            <li>• Great for urgent updates and appointment reminders</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
