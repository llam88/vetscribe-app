"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Mail, 
  Printer, 
  Stethoscope,
  Zap
} from "lucide-react"

interface DentalFindings {
  [toothNumber: string]: string
}

interface DentalRecommendation {
  type: string
  count: number
  description: string
  urgency: 'low' | 'medium' | 'high'
}

interface DentalChartData {
  species: string
  teeth_layout: {
    upper_right: string[]
    upper_left: string[]
    lower_left: string[]
    lower_right: string[]
  }
  findings: DentalFindings
  conditions: {
    normal: number
    gingivitis: number
    calculus: number
    periodontal: number
    fracture: number
    missing: number
    other: number
  }
  recommendations: DentalRecommendation[]
  total_teeth: number
  affected_teeth: number
}

interface DentalChartViewerProps {
  appointmentNotes: string
  patientName: string
  species: string
}

export function DentalChartViewer({ appointmentNotes, patientName, species }: DentalChartViewerProps) {
  const [dentalData, setDentalData] = useState<DentalChartData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeDentalFindings = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/analyze-dental', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: appointmentNotes,
          species: species.toLowerCase()
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setDentalData(result.chartData)
      } else {
        setError(result.error || 'Failed to analyze dental findings')
      }
    } catch (err) {
      setError('Error analyzing dental findings')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getToothColor = (toothNumber: string) => {
    if (!dentalData?.findings[toothNumber]) return 'bg-gray-100 border-gray-300'
    
    const condition = dentalData.findings[toothNumber]
    
    switch (condition) {
      case 'normal': return 'bg-green-100 border-green-300'
      case 'gingivitis': return 'bg-yellow-100 border-yellow-300'
      case 'calculus': return 'bg-orange-100 border-orange-300'
      case 'fracture': return 'bg-red-100 border-red-300'
      case 'missing':
      case 'extracted': return 'bg-gray-300 border-gray-500'
      default: 
        if (condition.includes('pocket')) return 'bg-purple-100 border-purple-300'
        return 'bg-blue-100 border-blue-300'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const renderToothQuadrant = (teeth: string[], quadrantName: string) => (
    <div className="mb-4">
      <h4 className="text-sm font-medium mb-2 text-center">{quadrantName}</h4>
      <div className="flex flex-wrap gap-1 justify-center">
        {teeth.map(toothNumber => {
          const condition = dentalData?.findings[toothNumber]
          return (
            <div
              key={toothNumber}
              className={`
                w-8 h-10 border-2 rounded-sm flex items-center justify-center text-xs font-mono
                ${getToothColor(toothNumber)}
                ${condition ? 'cursor-pointer hover:shadow-md' : ''}
                transition-all duration-200
              `}
              title={condition ? `${toothNumber}: ${condition}` : `${toothNumber}: normal`}
            >
              {toothNumber.slice(-2)}
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Analysis Trigger */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            AI Dental Chart Generator
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Analyze COHAT notes and examination findings to generate interactive dental charts
          </p>
        </CardHeader>
        <CardContent>
          {!dentalData ? (
            <div className="space-y-4">
              <Alert>
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  AI will analyze your appointment notes for dental findings and generate an interactive dental chart for {patientName} ({species}).
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-4 items-center">
                <Button 
                  onClick={analyzeDentalFindings}
                  disabled={loading || !appointmentNotes}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Dental Chart
                    </>
                  )}
                </Button>
                
                {!appointmentNotes && (
                  <p className="text-sm text-muted-foreground">
                    Add appointment notes to enable dental analysis
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Dental Chart Generated</span>
                </div>
                <Button 
                  onClick={analyzeDentalFindings}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                >
                  Re-analyze
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold">{dentalData.total_teeth}</div>
                  <div className="text-muted-foreground">Total Teeth</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{dentalData.affected_teeth}</div>
                  <div className="text-muted-foreground">With Findings</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {Math.round(((dentalData.total_teeth - dentalData.affected_teeth) / dentalData.total_teeth) * 100)}%
                  </div>
                  <div className="text-muted-foreground">Healthy</div>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Dental Chart Display */}
      {dentalData && (
        <Card>
          <CardHeader>
            <CardTitle>Interactive Dental Chart - {patientName}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {dentalData.species.charAt(0).toUpperCase() + dentalData.species.slice(1)} dental anatomy with AI-detected findings
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="chart" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chart">Dental Chart</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="chart" className="space-y-6">
                {/* Legend */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Chart Legend</h4>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-100 border-gray-300 border rounded"></div>
                      <span>Normal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-100 border-yellow-300 border rounded"></div>
                      <span>Gingivitis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-100 border-orange-300 border rounded"></div>
                      <span>Calculus</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-purple-100 border-purple-300 border rounded"></div>
                      <span>Periodontal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-100 border-red-300 border rounded"></div>
                      <span>Fracture</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-300 border-gray-500 border rounded"></div>
                      <span>Missing</span>
                    </div>
                  </div>
                </div>

                {/* Dental Chart */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    {renderToothQuadrant(dentalData.teeth_layout.upper_left, 'Upper Left')}
                    {renderToothQuadrant(dentalData.teeth_layout.lower_left, 'Lower Left')}
                  </div>
                  <div>
                    {renderToothQuadrant(dentalData.teeth_layout.upper_right, 'Upper Right')}
                    {renderToothQuadrant(dentalData.teeth_layout.lower_right, 'Lower Right')}
                  </div>
                </div>

                {/* Export Actions */}
                <div className="flex gap-2 justify-center pt-4 border-t">
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Email to Client
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-2" />
                    Print Chart
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(dentalData.conditions).map(([condition, count]) => (
                    <Card key={condition} className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{count}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {condition.replace('_', ' ')}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {Object.keys(dentalData.findings).length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Detailed Findings</h4>
                    <div className="space-y-2">
                      {Object.entries(dentalData.findings).map(([tooth, condition]) => (
                        <div key={tooth} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-mono text-sm">Tooth {tooth}</span>
                          <Badge variant="secondary">{condition}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                {dentalData.recommendations.map((rec, index) => (
                  <Card key={index} className={`p-4 border-l-4 ${
                    rec.urgency === 'high' ? 'border-l-red-500' :
                    rec.urgency === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium flex items-center gap-2">
                          {rec.type}
                          {rec.count > 0 && (
                            <Badge variant="outline">{rec.count} teeth</Badge>
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {rec.description}
                        </p>
                      </div>
                      <Badge className={`border ${
                        rec.urgency === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                        rec.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                        'bg-green-100 text-green-800 border-green-200'
                      }`}>
                        {rec.urgency} priority
                      </Badge>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
