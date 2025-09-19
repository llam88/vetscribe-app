"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Copy, 
  ExternalLink, 
  CheckCircle2, 
  Download,
  Zap,
  Info,
  Settings,
  Plus,
  Edit3,
  Save
} from "lucide-react"

interface PimsTransferProps {
  appointmentData: any
}

const PIMS_SYSTEMS = [
  { 
    name: "ezyVet", 
    url: "https://app.ezyvet.com",
    defaultFormat: `Patient: {patient_name}
Owner: {owner_name}
Date: {date}
Type: {appointment_type}

SOAP Notes:
{soap_note}

Summary: {client_summary}`
  },
  { 
    name: "AVImark", 
    url: "https://avimark.com",
    defaultFormat: `{soap_note}`
  },
  { 
    name: "ImproMed Infinity", 
    url: "https://impromed.com", 
    defaultFormat: `{patient_name} - {appointment_type}
{soap_note}`
  },
  { 
    name: "VetBlue", 
    url: "https://vetblue.com",
    defaultFormat: `Patient: {patient_name}
Owner: {owner_name}
Visit Date: {date}

{soap_note}

Client Summary:
{client_summary}`
  },
  { 
    name: "Custom Format", 
    url: "",
    defaultFormat: `{patient_name} - {date}
{soap_note}`
  }
]

export function SmartPimsTransfer({ appointmentData }: PimsTransferProps) {
  const [selectedPims, setSelectedPims] = useState(PIMS_SYSTEMS[0])
  const [customFormat, setCustomFormat] = useState("")
  const [copied, setCopied] = useState(false)
  const [showCustomizer, setShowCustomizer] = useState(false)

  // Load user's custom format for this PIMS
  useEffect(() => {
    const savedFormats = localStorage.getItem('vetscribe-pims-formats')
    if (savedFormats) {
      try {
        const formats = JSON.parse(savedFormats)
        const userFormat = formats[selectedPims.name]
        if (userFormat) {
          setCustomFormat(userFormat)
        } else {
          setCustomFormat(selectedPims.defaultFormat)
        }
      } catch (error) {
        setCustomFormat(selectedPims.defaultFormat)
      }
    } else {
      setCustomFormat(selectedPims.defaultFormat)
    }
  }, [selectedPims])

  const saveCustomFormat = () => {
    try {
      const savedFormats = JSON.parse(localStorage.getItem('vetscribe-pims-formats') || '{}')
      savedFormats[selectedPims.name] = customFormat
      localStorage.setItem('vetscribe-pims-formats', JSON.stringify(savedFormats))
      alert(`✅ Custom format saved for ${selectedPims.name}`)
    } catch (error) {
      alert('❌ Error saving custom format')
    }
  }

  const formatForPims = () => {
    const formatTemplate = customFormat || selectedPims.defaultFormat
    
    return formatTemplate
      .replace(/{patient_name}/g, appointmentData.patient_name || 'Unknown')
      .replace(/{owner_name}/g, appointmentData.owner_name || 'Unknown')
      .replace(/{date}/g, new Date(appointmentData.created_at).toLocaleDateString())
      .replace(/{appointment_type}/g, appointmentData.appointment_type || 'Visit')
      .replace(/{soap_note}/g, appointmentData.soap_note || 'SOAP notes not generated yet')
      .replace(/{client_summary}/g, appointmentData.client_summary || 'Client summary not generated yet')
      .replace(/{transcription}/g, appointmentData.transcription || 'Transcription not available')
  }

  const copyToClipboard = async () => {
    const formattedText = formatForPims()
    try {
      await navigator.clipboard.writeText(formattedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('Failed to copy to clipboard. Please copy manually.')
    }
  }

  const openPimsAndCopy = async () => {
    await copyToClipboard()
    if (selectedPims.url) {
      window.open(selectedPims.url, '_blank')
    }
  }

  if (!appointmentData?.soap_note) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔗 Transfer to PIMS
            <Badge variant="outline">Generate SOAP First</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Generate SOAP notes first to enable PIMS transfer
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔗 Smart PIMS Transfer
          <Badge className="bg-blue-100 text-blue-800">Customizable</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Copy formatted notes to your PIMS. Customize the format for your specific system.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* PIMS Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pims-select">Select Your PIMS:</Label>
            <Select 
              value={selectedPims.name} 
              onValueChange={(value) => setSelectedPims(PIMS_SYSTEMS.find(p => p.name === value) || PIMS_SYSTEMS[0])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PIMS_SYSTEMS.map(system => (
                  <SelectItem key={system.name} value={system.name}>
                    {system.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowCustomizer(true)}
              className="flex-1"
            >
              <Settings className="h-4 w-4 mr-2" />
              Customize Format
            </Button>
          </div>
        </div>

        {/* Transfer Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button 
            onClick={openPimsAndCopy}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Zap className="h-4 w-4 mr-2" />
            Copy & Open PIMS
          </Button>
          
          <Button 
            onClick={copyToClipboard}
            variant="outline"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Notes Only
              </>
            )}
          </Button>
          
          <Button 
            onClick={() => {
              const formattedText = formatForPims()
              const blob = new Blob([formattedText], { type: 'text/plain' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `${appointmentData.patient_name}_${new Date().toISOString().split('T')[0]}_notes.txt`
              a.click()
              URL.revokeObjectURL(url)
            }}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Preview for {selectedPims.name}:</h4>
          <Textarea
            value={formatForPims()}
            readOnly
            rows={8}
            className="font-mono text-sm"
          />
        </div>

        {/* Format Customizer Dialog */}
        <Dialog open={showCustomizer} onOpenChange={setShowCustomizer}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Customize Format for {selectedPims.name}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Pro Tip:</strong> Ask your PIMS administrator what format they prefer, then customize it here!
                </AlertDescription>
              </Alert>
              
              <div>
                <Label htmlFor="custom-format">Format Template:</Label>
                <Textarea
                  id="custom-format"
                  value={customFormat}
                  onChange={(e) => setCustomFormat(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                  placeholder="Use variables like {patient_name}, {soap_note}, {date}, etc."
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-medium text-blue-900 mb-2">Available Variables:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                  <code>{'{patient_name}'}</code>
                  <code>{'{owner_name}'}</code>
                  <code>{'{date}'}</code>
                  <code>{'{appointment_type}'}</code>
                  <code>{'{soap_note}'}</code>
                  <code>{'{client_summary}'}</code>
                  <code>{'{transcription}'}</code>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium mb-2">Live Preview:</h4>
                <pre className="text-xs whitespace-pre-wrap">{formatForPims()}</pre>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={saveCustomFormat} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Custom Format
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCustomFormat(selectedPims.defaultFormat)}
                >
                  Reset to Default
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">💡 How to Get the Right Format:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li><strong>Ask your PIMS administrator</strong> what format they prefer for imported notes</li>
                <li><strong>Try the default format</strong> first - most PIMS accept standard SOAP notes</li>
                <li><strong>Customize if needed</strong> using the format editor above</li>
                <li><strong>Save your custom format</strong> - it will remember for future transfers</li>
              </ol>
              <p className="text-sm text-blue-700 mt-2">
                <strong>Don't know your PIMS format?</strong> The default usually works fine - just paste it into your medical records section!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
