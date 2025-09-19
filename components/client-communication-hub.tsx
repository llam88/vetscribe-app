"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import {
  Mail,
  MessageSquare,
  Send,
  FileText,
  Zap
} from "lucide-react"

interface Appointment {
  id: string
  patient_name: string
  owner_name: string
  species: string
  appointment_type: string
  created_at: string
  transcription?: string
  soap_note?: string
  client_summary?: string
}

interface ClientCommunicationHubProps {
  appointments: Appointment[]
}

interface EmailDraft {
  appointmentId: string
  subject: string
  body: string
  recipientEmail: string
  patientName: string
  ownerName: string
}

export function ClientCommunicationHub({ appointments }: ClientCommunicationHubProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [emailDrafts, setEmailDrafts] = useState<Record<string, EmailDraft>>({})
  const [loadingAppointments, setLoadingAppointments] = useState<Record<string, boolean>>({})
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)

  const generateOrOpenEmail = async (appointment: Appointment) => {
    // Check if draft already exists
    const existingDraft = emailDrafts[appointment.id]
    if (existingDraft) {
      setCurrentDraftId(appointment.id)
      setShowEmailDialog(true)
      return
    }

    if (!appointment.soap_note && !appointment.client_summary) {
      alert('Generate SOAP notes or client summary first')
      return
    }

    // Set loading for this specific appointment
    setLoadingAppointments(prev => ({ ...prev, [appointment.id]: true }))
    
    try {
      const response = await fetch('/api/generate-client-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: appointment.patient_name,
          ownerName: appointment.owner_name,
          appointmentType: appointment.appointment_type,
          visitDate: new Date(appointment.created_at).toLocaleDateString(),
          transcription: appointment.transcription,
          soapNote: appointment.soap_note
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Create new draft
        const newDraft: EmailDraft = {
          appointmentId: appointment.id,
          subject: `${appointment.patient_name}'s Visit Summary`,
          body: result.email,
          recipientEmail: '',
          patientName: appointment.patient_name,
          ownerName: appointment.owner_name
        }
        
        setEmailDrafts(prev => ({ ...prev, [appointment.id]: newDraft }))
        setCurrentDraftId(appointment.id)
        setShowEmailDialog(true)
      } else {
        alert('Error generating email')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error generating email')
    } finally {
      // Clear loading for this specific appointment
      setLoadingAppointments(prev => ({ ...prev, [appointment.id]: false }))
    }
  }

  const sendEmail = async () => {
    if (!recipientEmail) {
      alert('Please enter recipient email')
      return
    }

    if (!generatedEmail) {
      alert('Please generate an email first')
      return
    }

    try {
      setLoadingAppointments(prev => ({ ...prev, 'sending_email': true }))
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail,
          subject: emailSubject,
          body: generatedEmail,
          patientName: 'Patient', // We'll get this from context
          ownerName: recipientEmail.split('@')[0] // Fallback
        })
      })

      const result = await response.json()
      
      if (result.success) {
        if (result.method === 'mailto') {
          // Fallback to mailto
          window.open(result.mailtoLink)
          alert('📧 Email service not configured. Opening your default email client instead.')
        } else {
          // Real email sent
          alert(`✅ Email sent successfully to ${recipientEmail}!`)
          setGeneratedEmail('')
          setRecipientEmail('')
          setEmailSubject('')
        }
      } else {
        alert(`❌ Failed to send email: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert('❌ Error sending email. Please try again.')
    } finally {
      setLoadingAppointments(prev => ({ ...prev, 'sending_email': false }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Generation from Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Generate Client Emails
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Create professional emails for pet owners based on appointment notes
          </p>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="mb-2">No appointments with SOAP notes found</p>
              <p className="text-sm">Create appointments and generate SOAP notes first</p>
        </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4">
                {appointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                <div>
                        <h4 className="font-medium">{appointment.patient_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Owner: {appointment.owner_name} • {appointment.appointment_type} • {appointment.created_at?.split('T')[0] || 'No date'}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {appointment.soap_note && <Badge variant="secondary">SOAP Note</Badge>}
                          {appointment.client_summary && <Badge variant="secondary">Summary</Badge>}
                        </div>
                </div>
                      <Button 
                        onClick={() => {
                          setSelectedAppointment(appointment)
                          generateClientEmail(appointment)
                        }}
                        disabled={loadingAppointments[appointment.id]}
                        size="sm"
                      >
                        {loadingAppointments[appointment.id] ? "Generating..." : "Generate Email"}
                      </Button>
                    </div>
                </div>
                ))}
              </div>

              {appointments.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  Showing 5 most recent appointments • <a href="/appointments" className="text-blue-600 hover:underline">View all</a>
                </p>
              )}
                </div>
          )}
        </CardContent>
      </Card>

      {/* Email Preview and Send Dialog - FIXED SCROLLING */}
      {selectedAppointment && generatedEmail && (
        <Dialog open={!!generatedEmail} onOpenChange={() => setGeneratedEmail("")}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>
                Email for {selectedAppointment.patient_name} - {selectedAppointment.owner_name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Email subject"
                  />
              </div>

                <div>
                  <Label htmlFor="recipient">Recipient Email</Label>
                  <Input
                    id="recipient"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="owner@email.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="emailContent">Email Content</Label>
                <Textarea
                  id="emailContent"
                  value={generatedEmail}
                  onChange={(e) => setGeneratedEmail(e.target.value)}
                  rows={20}
                  className="text-sm resize-none"
                />
              </div>
            </div>
            
            <DialogFooter className="flex-shrink-0 border-t pt-4">
              <Button variant="outline" onClick={() => setGeneratedEmail("")}>
                Close
              </Button>
              <Button onClick={() => navigator.clipboard.writeText(generatedEmail)} variant="outline">
                Copy Email
              </Button>
              <Button 
                onClick={sendEmail} 
                disabled={loadingAppointments['sending_email']}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loadingAppointments['sending_email'] ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Recent Communications History */}
          <Card>
            <CardHeader>
                  <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Communication History
                  </CardTitle>
            </CardHeader>
            <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Communication history will appear here</p>
            <p className="text-sm">Send your first client email to get started</p>
                  </div>
            </CardContent>
          </Card>
    </div>
  )
}