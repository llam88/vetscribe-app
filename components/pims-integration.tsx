"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Activity, 
  CheckCircle2, 
  Database, 
  DollarSign, 
  Calendar, 
  Mail,
  Settings,
  Zap
} from "lucide-react"

interface PimsIntegrationProps {
  appointmentData: any
  isVisible?: boolean
}

const PIMS_SYSTEMS = [
  "Demo Mode (Simulation)",
  "ezyVet (Cloud-based)",
  "Cornerstone (AVImark)", 
  "ImproMed Infinity",
  "VetBlue",
  "Pulse Veterinary",
  "Vetspire"
]

export function PimsIntegration({ appointmentData, isVisible = true }: PimsIntegrationProps) {
  const [selectedPims, setSelectedPims] = useState("Demo Mode (Simulation)")
  const [isIntegrating, setIsIntegrating] = useState(false)
  const [integrationProgress, setIntegrationProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [integrationResults, setIntegrationResults] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)

  const performIntegration = async () => {
    if (!appointmentData?.soap_note) {
      alert('Generate SOAP notes first to enable PIMS integration')
      return
    }

    setIsIntegrating(true)
    setIntegrationProgress(0)
    setIntegrationResults(null)

    try {
      const response = await fetch('/api/pims-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentData,
          pimsSystem: selectedPims
        })
      })

      const result = await response.json()

      if (result.success) {
        // Simulate step-by-step progress
        for (const step of result.data.steps) {
          setCurrentStep(step.step)
          setIntegrationProgress(step.progress)
          await new Promise(resolve => setTimeout(resolve, step.delay))
        }

        setIntegrationResults(result.data)
        setCurrentStep("Integration complete!")
      } else {
        throw new Error(result.message || 'Integration failed')
      }
    } catch (error) {
      console.error('PIMS integration error:', error)
      alert('PIMS integration failed. Please try again.')
    } finally {
      setIsIntegrating(false)
    }
  }

  const previewExportData = () => {
    setShowPreview(!showPreview)
  }

  if (!isVisible) return null

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔗 Practice Management Integration
          <Badge variant="secondary">Demo</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Export appointment data to your practice management system
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* PIMS System Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Select your practice management system:
          </label>
          <Select value={selectedPims} onValueChange={setSelectedPims}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PIMS_SYSTEMS.map(system => (
                <SelectItem key={system} value={system}>
                  {system}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Integration Controls */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={performIntegration}
            disabled={isIntegrating || !appointmentData?.soap_note}
            className="bg-primary hover:bg-primary/90"
          >
            {isIntegrating ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Integrating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Export to PIMS
              </>
            )}
          </Button>

          <Button 
            onClick={previewExportData}
            variant="outline"
          >
            <Database className="h-4 w-4 mr-2" />
            Preview Export Data
          </Button>
        </div>

        {/* Integration Progress */}
        {isIntegrating && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>{currentStep}</span>
              <span>{integrationProgress}%</span>
            </div>
            <Progress value={integrationProgress} className="h-2" />
          </div>
        )}

        {/* Integration Results */}
        {integrationResults && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <h4 className="font-medium text-green-900">Integration Successful!</h4>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">{integrationResults.results.recordsUpdated}</div>
                <div className="text-xs text-green-600">Records Updated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">{integrationResults.results.billingGenerated}</div>
                <div className="text-xs text-green-600">Billing Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">{integrationResults.results.followUpScheduled}</div>
                <div className="text-xs text-green-600">Follow-up</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">{integrationResults.integrationTime}</div>
                <div className="text-xs text-green-600">Integration Time</div>
              </div>
            </div>

            <Alert>
              <Activity className="h-4 w-4" />
              <AlertDescription>
                Data successfully exported to {integrationResults.pimsSystem}. 
                Patient record updated with new appointment information.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Export Data Preview */}
        {showPreview && integrationResults && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Export Data Preview</h4>
            <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-60">
              {JSON.stringify(integrationResults.exportData, null, 2)}
            </pre>
          </div>
        )}

        {/* Billing Codes */}
        {integrationResults?.billingCodes && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              Generated Billing Codes
            </h4>
            <div className="space-y-2">
              {Object.entries(integrationResults.billingCodes).map(([code, description]) => (
                <div key={code} className="flex justify-between items-center text-sm">
                  <span className="font-mono">{code}</span>
                  <span className="text-muted-foreground">{String(description)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!appointmentData?.soap_note && (
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              Generate SOAP notes first to enable PIMS integration
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
