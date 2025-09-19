"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Send, Eye, Save, BookTemplate as Template, Mail, User, Calendar, Heart } from "lucide-react"

interface EmailComposerProps {
  patientName: string
  ownerName: string
  ownerEmail?: string
  visitType: string
  visitDate: string
  notes: string
  onSend?: (emailData: any) => void
  onSave?: (emailData: any) => void
}

const emailTemplates = {
  wellness: {
    subject: "{{patientName}}'s Wellness Exam Results",
    body: `Dear {{ownerName}},

Thank you for bringing {{patientName}} in for their wellness examination today. I'm pleased to report that {{patientName}} is in good health!

Here's a summary of today's visit:

**What We Checked:**
- Complete physical examination
- Weight and body condition assessment
- Vital signs (temperature, heart rate, breathing)
- Dental health evaluation

**Our Findings:**
{{patientName}} appears to be in excellent health. All vital signs were normal, and the physical examination didn't reveal any concerns.

**Recommendations:**
- Continue with current diet and exercise routine
- Keep up with regular grooming
- Monitor for any changes in appetite, behavior, or bathroom habits

**Next Steps:**
We'll see {{patientName}} again in 12 months for their next wellness exam. Please don't hesitate to call if you have any questions or concerns.

Thank you for being such a caring pet parent!

Best regards,
Dr. [Your Name]
[Clinic Name]
[Phone Number]`,
  },
  vaccination: {
    subject: "{{patientName}}'s Vaccination Appointment - Complete",
    body: `Dear {{ownerName}},

{{patientName}} did great during their vaccination appointment today! All vaccines were administered successfully.

**Vaccines Given Today:**
- [List specific vaccines administered]

**What to Watch For:**
It's normal for pets to experience mild side effects after vaccinations, including:
- Slight lethargy for 24-48 hours
- Mild soreness at injection site
- Decreased appetite for a day

**When to Call Us:**
Please contact us immediately if {{patientName}} experiences:
- Severe lethargy lasting more than 2 days
- Vomiting or diarrhea
- Difficulty breathing
- Swelling of the face or injection site

**Next Vaccines Due:**
{{patientName}}'s next vaccinations are due in 12 months.

Thank you for keeping {{patientName}} protected and healthy!

Best regards,
Dr. [Your Name]
[Clinic Name]
[Phone Number]`,
  },
  dental: {
    subject: "{{patientName}}'s Dental Procedure - Post-Care Instructions",
    body: `Dear {{ownerName}},

{{patientName}} did wonderfully during their dental procedure today. The cleaning and any necessary extractions have been completed successfully.

**Post-Procedure Care:**
- Soft food diet for the next 7 days
- Give prescribed medications as directed
- Monitor for any unusual bleeding or swelling
- Prevent {{patientName}} from chewing on hard toys or bones for 1 week

**What's Normal:**
- Mild drowsiness from anesthesia (should resolve within 24 hours)
- Slight bleeding from gum line for first day
- Bad breath that gradually improves

**When to Call:**
Contact us if you notice:
- Excessive bleeding
- Severe swelling
- Refusal to eat for more than 24 hours
- Signs of pain or distress

**Follow-up:**
We'd like to see {{patientName}} in 2 weeks to check healing progress.

{{patientName}}'s teeth are now clean and healthy! With proper home care, we can help maintain their dental health.

Best regards,
Dr. [Your Name]
[Clinic Name]
[Phone Number]`,
  },
}

export function ClientEmailComposer({
  patientName,
  ownerName,
  ownerEmail = "",
  visitType,
  visitDate,
  notes,
  onSend,
  onSave,
}: EmailComposerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof emailTemplates>("wellness")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [recipientEmail, setRecipientEmail] = useState(ownerEmail)
  const [ccEmails, setCcEmails] = useState("")
  const [isPreview, setIsPreview] = useState(false)

  const applyTemplate = (templateKey: keyof typeof emailTemplates) => {
    const template = emailTemplates[templateKey]
    const processedSubject = template.subject
      .replace(/{{patientName}}/g, patientName)
      .replace(/{{ownerName}}/g, ownerName)

    const processedBody = template.body.replace(/{{patientName}}/g, patientName).replace(/{{ownerName}}/g, ownerName)

    setEmailSubject(processedSubject)
    setEmailBody(processedBody)
    setSelectedTemplate(templateKey)
  }

  const handleSend = () => {
    const emailData = {
      to: recipientEmail,
      cc: ccEmails,
      subject: emailSubject,
      body: emailBody,
      patientName,
      ownerName,
      visitType,
      visitDate,
    }
    onSend?.(emailData)
  }

  const handleSave = () => {
    const emailData = {
      subject: emailSubject,
      body: emailBody,
      template: selectedTemplate,
    }
    onSave?.(emailData)
  }

  return (
    <div className="space-y-6">
      {/* Patient Info Header */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Client Communication
          </CardTitle>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              {patientName}
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {ownerName}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {visitDate}
            </div>
            <Badge variant="outline">{visitType}</Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Template Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Template className="h-5 w-5" />
                Email Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(emailTemplates).map(([key, template]) => (
                <div
                  key={key}
                  onClick={() => applyTemplate(key as keyof typeof emailTemplates)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedTemplate === key ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <h3 className="font-medium text-sm capitalize">{key} Exam</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {template.subject.replace(/{{patientName}}/g, patientName)}
                  </p>
                </div>
              ))}
              <div className="pt-2 border-t border-border">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Template className="h-4 w-4 mr-2" />
                  Custom Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Composer */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Compose Email</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsPreview(!isPreview)}>
                    <Eye className="h-4 w-4 mr-2" />
                    {isPreview ? "Edit" : "Preview"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button size="sm" onClick={handleSend} className="bg-accent hover:bg-accent/90">
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!isPreview ? (
                <div className="space-y-4">
                  {/* Email Recipients */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="recipient">To</Label>
                      <Input
                        id="recipient"
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="owner@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cc">CC (optional)</Label>
                      <Input
                        id="cc"
                        type="email"
                        value={ccEmails}
                        onChange={(e) => setCcEmails(e.target.value)}
                        placeholder="assistant@clinic.com"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Email subject..."
                    />
                  </div>

                  {/* Email Body */}
                  <div>
                    <Label htmlFor="body">Message</Label>
                    <Textarea
                      id="body"
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="min-h-96"
                      placeholder="Compose your email message..."
                    />
                  </div>
                </div>
              ) : (
                /* Email Preview */
                <div className="space-y-4">
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <div className="text-sm">
                      <strong>To:</strong> {recipientEmail}
                      {ccEmails && (
                        <>
                          <br />
                          <strong>CC:</strong> {ccEmails}
                        </>
                      )}
                    </div>
                    <div className="text-sm">
                      <strong>Subject:</strong> {emailSubject}
                    </div>
                  </div>
                  <div className="bg-background border border-border rounded-lg p-6">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{emailBody}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
