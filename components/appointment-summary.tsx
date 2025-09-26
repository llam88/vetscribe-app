"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Mail, Download, Copy, CheckCircle2, AlertCircle } from "lucide-react"

interface AppointmentSummaryProps {
  appointment: any
}

export function AppointmentSummary({ appointment }: AppointmentSummaryProps) {
  const hasTranscription = !!appointment.transcription
  const hasSOAP = !!appointment.soap_note  
  const hasSummary = !!appointment.client_summary

  const copyToClipboard = (content: string, type: string) => {
    navigator.clipboard.writeText(content)
    alert(`✅ ${type} copied to clipboard!`)
  }

  const exportToPDF = async (content: string, filename: string) => {
    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: filename,
          content: content
        })
      })
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename.replace(/\s+/g, '_').toLowerCase()}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PDF export error:', error)
      alert('Error exporting PDF')
    }
  }

  return (
    <div className="space-y-6">
      {/* Appointment Overview */}
      <Card>
        <CardHeader>
          <CardTitle>
            {appointment.patient_name}'s Complete Record
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {appointment.appointment_type} • Owner: {appointment.owner_name} • {appointment.species}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className={`text-center p-4 rounded-lg ${hasTranscription ? 'bg-green-50' : 'bg-gray-50'}`}>
              {hasTranscription ? (
                <CheckCircle2 className="mx-auto h-8 w-8 text-green-600 mb-2" />
              ) : (
                <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              )}
              <h4 className="font-medium">Transcription</h4>
              <p className="text-xs text-muted-foreground">
                {hasTranscription ? `${appointment.transcription.split(' ').length} words` : 'Not available'}
              </p>
            </div>
            
            <div className={`text-center p-4 rounded-lg ${hasSOAP ? 'bg-green-50' : 'bg-gray-50'}`}>
              {hasSOAP ? (
                <CheckCircle2 className="mx-auto h-8 w-8 text-green-600 mb-2" />
              ) : (
                <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              )}
              <h4 className="font-medium">SOAP Note</h4>
              <p className="text-xs text-muted-foreground">
                {hasSOAP ? 'Professional documentation' : 'Not generated'}
              </p>
            </div>
            
            <div className={`text-center p-4 rounded-lg ${hasSummary ? 'bg-green-50' : 'bg-gray-50'}`}>
              {hasSummary ? (
                <CheckCircle2 className="mx-auto h-8 w-8 text-green-600 mb-2" />
              ) : (
                <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              )}
              <h4 className="font-medium">Client Summary</h4>
              <p className="text-xs text-muted-foreground">
                {hasSummary ? 'Ready for client' : 'Not generated'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transcription */}
      {hasTranscription && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Transcription ({appointment.transcription.split(' ').length} words)
              </CardTitle>
              <Button 
                onClick={() => copyToClipboard(appointment.transcription, 'Transcription')}
                variant="outline" 
                size="sm"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto text-sm font-mono">
              {appointment.transcription}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SOAP Note */}
      {hasSOAP && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Professional SOAP Note
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  onClick={() => copyToClipboard(appointment.soap_note, 'SOAP Note')}
                  variant="outline" 
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button 
                  onClick={() => exportToPDF(appointment.soap_note, `SOAP Note - ${appointment.patient_name}`)}
                  variant="outline" 
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto text-sm">
              <pre className="whitespace-pre-wrap">{appointment.soap_note}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Summary */}
      {hasSummary && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Client Summary
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  onClick={() => copyToClipboard(appointment.client_summary, 'Client Summary')}
                  variant="outline" 
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <a href="/communication">
                    <Mail className="h-4 w-4 mr-2" />
                    Email to Client
                  </a>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto text-sm">
              <pre className="whitespace-pre-wrap">{appointment.client_summary}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-center">
            <Button variant="outline" asChild className="w-full sm:w-auto text-sm px-3 py-2">
              <a href="/appointments" className="flex items-center justify-center">
                <span className="truncate">← Back to Appointments</span>
              </a>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto text-sm px-3 py-2">
              <a href="/dashboard" className="flex items-center justify-center">
                <span className="truncate">🏠 Dashboard</span>
              </a>
            </Button>
            <Button asChild className="w-full sm:w-auto text-sm px-3 py-2">
              <a href={`/appointments/${appointment.id}/record`} className="flex items-center justify-center">
                <span className="truncate">📝 Continue Recording</span>
              </a>
            </Button>
            {(hasSOAP || hasSummary) && (
              <Button asChild className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-sm px-3 py-2">
                <a href="/communication" className="flex items-center justify-center">
                  <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Send Client Email</span>
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
