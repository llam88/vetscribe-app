"use client"

import { useState, useEffect } from "react"
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
  Zap,
  Edit3,
  Trash2,
  RefreshCw,
  Save,
  CheckCircle2
} from "lucide-react"

interface Appointment {
  id: string
  patient_name: string
  owner_name: string
  owner_phone?: string
  owner_email?: string
  species: string
  appointment_type: string
  created_at: string
  transcription?: string
  soap_note?: string
  client_summary?: string
}

interface EmailDraft {
  appointmentId: string
  subject: string
  body: string
  recipientEmail: string
  patientName: string
  ownerName: string
  lastModified: string
  sentHistory?: EmailSentRecord[]
}

interface EmailSentRecord {
  sentAt: string
  sentTo: string
  subject: string
  method: string
  messageId?: string
  status: 'sent' | 'failed'
}

interface ClientCommunicationHubProps {
  appointments: Appointment[]
}

export function ClientCommunicationHubEnhanced({ appointments }: ClientCommunicationHubProps) {
  const [emailDrafts, setEmailDrafts] = useState<Record<string, EmailDraft>>({})
  const [loadingAppointments, setLoadingAppointments] = useState<Record<string, boolean>>({})
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<string>("")

  // Load drafts from localStorage on component mount
  useEffect(() => {
    const loadDrafts = () => {
      try {
        const savedDrafts = localStorage.getItem('vetscribe-email-drafts')
        if (savedDrafts) {
          const parsedDrafts = JSON.parse(savedDrafts)
          // Filter out drafts older than 7 days to prevent clutter
          const sevenDaysAgo = new Date()
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
          
          const filteredDrafts = Object.entries(parsedDrafts).reduce((acc, [key, draft]) => {
            const draftDate = new Date((draft as EmailDraft).lastModified)
            if (draftDate > sevenDaysAgo) {
              acc[key] = draft as EmailDraft
            }
            return acc
          }, {} as Record<string, EmailDraft>)
          
          setEmailDrafts(filteredDrafts)
        }
      } catch (error) {
        console.error('Error loading email drafts:', error)
      }
    }
    
    loadDrafts()
  }, [])

  // Save drafts to localStorage whenever emailDrafts changes
  useEffect(() => {
    try {
      localStorage.setItem('vetscribe-email-drafts', JSON.stringify(emailDrafts))
      setLastSaved(new Date().toLocaleTimeString())
    } catch (error) {
      console.error('Error saving email drafts:', error)
    }
  }, [emailDrafts])

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
          recipientEmail: appointment.owner_email || '',
          patientName: appointment.patient_name,
          ownerName: appointment.owner_name,
          lastModified: new Date().toISOString()
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

  const updateDraft = (draftId: string, updates: Partial<EmailDraft>) => {
    setEmailDrafts(prev => ({
      ...prev,
      [draftId]: { 
        ...prev[draftId], 
        ...updates,
        lastModified: new Date().toISOString()
      }
    }))
  }

  const deleteDraft = (draftId: string) => {
    setEmailDrafts(prev => {
      const updated = { ...prev }
      delete updated[draftId]
      return updated
    })
    if (currentDraftId === draftId) {
      setCurrentDraftId(null)
      setShowEmailDialog(false)
    }
  }

  const regenerateEmail = async (draftId: string) => {
    const appointment = appointments.find(a => a.id === draftId)
    if (!appointment) return
    
    // Remove existing draft and regenerate
    deleteDraft(draftId)
    await generateOrOpenEmail(appointment)
  }

  const sendEmail = async () => {
    if (!currentDraftId) return
    
    const draft = emailDrafts[currentDraftId]
    if (!draft) return

    if (!draft.recipientEmail) {
      alert('Please enter recipient email')
      return
    }

    try {
      setLoadingAppointments(prev => ({ ...prev, 'sending_email': true }))
      
      const response = await fetch('/api/send-user-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: draft.recipientEmail,
          subject: draft.subject,
          body: draft.body,
          patientName: draft.patientName,
          ownerName: draft.ownerName
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Add to sent history
        const sentRecord: EmailSentRecord = {
          sentAt: new Date().toISOString(),
          sentTo: draft.recipientEmail,
          subject: draft.subject,
          method: result.method || 'unknown',
          messageId: result.messageId,
          status: 'sent'
        }

        // Update draft with sent history
        const updatedDraft = {
          ...draft,
          sentHistory: [...(draft.sentHistory || []), sentRecord]
        }
        
        setEmailDrafts(prev => ({
          ...prev,
          [currentDraftId]: updatedDraft
        }))

        if (result.method === 'mailto') {
          // Fallback to mailto
          window.open(result.mailtoLink)
          alert('📧 Opening your default email client...')
        } else {
          alert(`✅ Email sent successfully to ${draft.recipientEmail}!`)
        }
        
        // Close dialog but keep draft for reference
        setShowEmailDialog(false)
      } else {
        // Add failed attempt to history
        const failedRecord: EmailSentRecord = {
          sentAt: new Date().toISOString(),
          sentTo: draft.recipientEmail,
          subject: draft.subject,
          method: 'failed',
          status: 'failed'
        }

        const updatedDraft = {
          ...draft,
          sentHistory: [...(draft.sentHistory || []), failedRecord]
        }
        
        setEmailDrafts(prev => ({
          ...prev,
          [currentDraftId]: updatedDraft
        }))

        alert(`❌ Failed to send email: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Send email error:', error)
      alert('❌ Error sending email. Check console for details.')
    } finally {
      setLoadingAppointments(prev => ({ ...prev, 'sending_email': false }))
    }
  }

  const currentDraft = currentDraftId ? emailDrafts[currentDraftId] : null
  const draftsArray = Object.values(emailDrafts)

  return (
    <div className="space-y-6">
      {/* Email Drafts Management */}
      {draftsArray.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Email Drafts ({draftsArray.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage and edit your generated emails before sending. Drafts are automatically saved and persist between sessions.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {draftsArray.map((draft) => {
                const sentCount = draft.sentHistory?.filter(h => h.status === 'sent').length || 0
                const lastSent = draft.sentHistory?.filter(h => h.status === 'sent').sort((a, b) => 
                  new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
                )[0]
                
                return (
                  <div key={draft.appointmentId} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{draft.patientName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {draft.subject} • Modified {new Date(draft.lastModified).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {sentCount > 0 && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Sent {sentCount}x
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Sent History */}
                    {draft.sentHistory && draft.sentHistory.length > 0 && (
                      <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
                        <div className="font-medium mb-1">📧 Email History:</div>
                        {draft.sentHistory.slice(-3).map((record, index) => (
                          <div key={index} className={`flex items-center justify-between ${
                            record.status === 'sent' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <span>
                              {record.status === 'sent' ? '✅' : '❌'} 
                              {record.sentTo} • {new Date(record.sentAt).toLocaleString()}
                            </span>
                            <span className="text-muted-foreground">{record.method}</span>
                          </div>
                        ))}
                        {draft.sentHistory.length > 3 && (
                          <div className="text-muted-foreground">
                            ... and {draft.sentHistory.length - 3} more
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setCurrentDraftId(draft.appointmentId)
                        setShowEmailDialog(true)
                      }}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => regenerateEmail(draft.appointmentId)}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Regenerate
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => deleteDraft(draft.appointmentId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
                {appointments.slice(0, 10).map((appointment) => {
                  const hasDraft = !!emailDrafts[appointment.id]
                  const isLoading = loadingAppointments[appointment.id]
                  
                  return (
                    <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{appointment.patient_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Owner: {appointment.owner_name} • {appointment.appointment_type} • {appointment.created_at?.split('T')[0]}
                          </p>
                          <div className="flex gap-2 mt-2">
                            {appointment.transcription && (
                              <Badge variant="secondary" className="text-xs">Transcribed</Badge>
                            )}
                            {appointment.soap_note && (
                              <Badge variant="secondary" className="text-xs">SOAP Notes</Badge>
                            )}
                            {appointment.client_summary && (
                              <Badge variant="secondary" className="text-xs">Client Summary</Badge>
                            )}
                            {hasDraft && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">Draft Ready</Badge>
                            )}
                            {(() => {
                              const draft = emailDrafts[appointment.id]
                              const sentCount = draft?.sentHistory?.filter(h => h.status === 'sent').length || 0
                              if (sentCount > 0) {
                                return (
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Sent {sentCount}x
                                  </Badge>
                                )
                              }
                              return null
                            })()}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => generateOrOpenEmail(appointment)}
                            disabled={isLoading || (!appointment.soap_note && !appointment.client_summary)}
                            className={hasDraft ? "bg-blue-600 hover:bg-blue-700" : ""}
                          >
                            {isLoading ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : hasDraft ? (
                              <>
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit Email
                              </>
                            ) : (
                              <>
                                <Zap className="h-4 w-4 mr-2" />
                                Generate Email
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Editing Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Edit Email for {currentDraft?.patientName}
            </DialogTitle>
          </DialogHeader>
          
          {currentDraft && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recipient">Recipient Email</Label>
                  <Input
                    id="recipient"
                    type="email"
                    placeholder="owner@example.com"
                    value={currentDraft.recipientEmail}
                    onChange={(e) => updateDraft(currentDraftId!, { recipientEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={currentDraft.subject}
                    onChange={(e) => updateDraft(currentDraftId!, { subject: e.target.value })}
                  />
                </div>
              </div>
              
              {/* Sent History in Dialog */}
              {currentDraft?.sentHistory && currentDraft.sentHistory.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Email Send History ({currentDraft.sentHistory.filter(h => h.status === 'sent').length} sent)
                  </h4>
                  <div className="space-y-1 text-sm">
                    {currentDraft.sentHistory.slice(-5).reverse().map((record, index) => (
                      <div key={index} className={`flex items-center justify-between p-2 rounded ${
                        record.status === 'sent' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <span className="flex items-center gap-2">
                          {record.status === 'sent' ? '✅' : '❌'}
                          <strong>{record.sentTo}</strong>
                          <span className="text-xs">• {new Date(record.sentAt).toLocaleString()}</span>
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {record.method}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="emailBody">Email Body</Label>
                <Textarea
                  id="emailBody"
                  rows={15}
                  value={currentDraft.body}
                  onChange={(e) => updateDraft(currentDraftId!, { body: e.target.value })}
                  className="font-mono text-sm"
                />
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Last modified: {new Date(currentDraft.lastModified).toLocaleString()}</span>
                {lastSaved && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Auto-saved at {lastSaved}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => regenerateEmail(currentDraftId!)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowEmailDialog(false)}
            >
              Save Draft
            </Button>
            <Button
              onClick={sendEmail}
              disabled={loadingAppointments['sending_email'] || !currentDraft?.recipientEmail}
              className="bg-green-600 hover:bg-green-700"
            >
              {loadingAppointments['sending_email'] ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
