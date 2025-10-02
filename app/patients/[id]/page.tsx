"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientBrowser } from "@/lib/supabase-browser"
import { MainNavigation } from "@/components/main-navigation"
import { NavigationBreadcrumb } from "@/components/navigation-breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Mail, Calendar, User, Stethoscope, Edit } from "lucide-react"

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const sb = createClientBrowser()
  const [patient, setPatient] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [patientId, setPatientId] = useState<string>("")
  const [isEditingPatient, setIsEditingPatient] = useState(false)
  const [editingPatient, setEditingPatient] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const resolvedParams = await params
        setPatientId(resolvedParams.id)
        
        const { data: { user } } = await sb.auth.getUser()
        if (!user) {
          router.push("/sign-in")
          return
        }

        // Get patient and their appointments
        const patientResult = await sb.from('patients').select('*').eq('id', resolvedParams.id).eq('user_id', user.id).single()
        
        if (patientResult.error || !patientResult.data) {
          router.push("/patients")
          return
        }

        setPatient(patientResult.data)

        // Get appointments for this patient
        const appointmentsResult = await sb
          .from('appointments')
          .select('*')
          .eq('patient_name', patientResult.data.name)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        setAppointments(appointmentsResult.data || [])
      } catch (error) {
        console.error('Error loading patient data:', error)
        router.push("/patients")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params, router, sb])

  const handleEditPatient = () => {
    setEditingPatient({ ...patient })
    setIsEditingPatient(true)
  }

  const handleSaveEdit = async () => {
    if (!editingPatient) return

    try {
      // Update patient record
      const { error: patientError } = await sb
        .from('patients')
        .update({
          name: editingPatient.name,
          species: editingPatient.species,
          breed: editingPatient.breed,
          age: editingPatient.age,
          sex: editingPatient.sex,
          weight: editingPatient.weight,
          owner: editingPatient.owner,
          owner_phone: editingPatient.owner_phone,
          owner_email: editingPatient.owner_email,
          notes: editingPatient.notes
        })
        .eq('id', patientId)

      if (patientError) {
        alert('Failed to update patient: ' + patientError.message)
        return
      }

      // SYNC: Update all appointments with this patient name
      const { error: appointmentError } = await sb
        .from('appointments')
        .update({
          patient_name: editingPatient.name,
          owner_name: editingPatient.owner,
          owner_phone: editingPatient.owner_phone,
          owner_email: editingPatient.owner_email,
          species: editingPatient.species,
          breed: editingPatient.breed
        })
        .eq('patient_name', patient.name) // Update all appointments with old patient name
        .eq('user_id', (await sb.auth.getUser()).data.user?.id)

      if (appointmentError) {
        console.warn('Failed to sync appointment data:', appointmentError)
        // Continue anyway - patient update succeeded
      } else {
        console.log('✅ Synced patient changes to all appointments')
      }

      // Update local state
      setPatient(editingPatient)
      setIsEditingPatient(false)
      setEditingPatient(null)
      alert('✅ Patient updated successfully! Changes synced to all appointments.')

      // Reload appointments to show updated data
      const { data: updatedAppointments } = await sb
        .from('appointments')
        .select('*')
        .eq('patient_name', editingPatient.name)
        .eq('user_id', (await sb.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false })

      if (updatedAppointments) {
        setAppointments(updatedAppointments)
      }

    } catch (error) {
      console.error('Error updating patient:', error)
      alert('Failed to update patient. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <div className="p-6 max-w-6xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading patient data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <div className="p-6 max-w-6xl mx-auto">
          <div className="text-center py-8">
            <p>Patient not found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="p-6 max-w-6xl mx-auto">
        <NavigationBreadcrumb 
          currentPage={`${patient.name}'s Profile`}
          parentPage={{ name: "Patients", href: "/patients" }}
        />
        
        <div className="space-y-6">
          {/* Patient Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{patient.name}</CardTitle>
                  <p className="text-muted-foreground">
                    {patient.species} • Owner: {patient.owner}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleEditPatient}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Patient
                  </Button>
                  <Button asChild>
                    <a href={`/appointments/${appointments[0]?.id}/record`}>
                      📝 New Recording
                    </a>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><strong>Species:</strong> {patient.species}</div>
                <div><strong>Breed:</strong> {patient.breed || 'Not specified'}</div>
                <div><strong>Age:</strong> {patient.age || 'Not specified'}</div>
                <div><strong>Sex:</strong> {patient.sex || 'Not specified'}</div>
                <div><strong>Weight:</strong> {patient.weight || 'Not specified'}</div>
                <div><strong>Owner:</strong> {patient.owner}</div>
                <div><strong>Added:</strong> {patient.created_at?.split('T')[0]}</div>
                <div><strong>Appointments:</strong> {appointments.length}</div>
              </div>
            </CardContent>
          </Card>

          {/* Appointment History with Full Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointment History ({appointments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No appointments recorded yet</p>
                  <Button asChild className="mt-4">
                    <a href="/appointments">Schedule First Appointment</a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {appointments.map((appointment, index) => (
                    <Card key={appointment.id} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {appointment.appointment_type} - {appointment.created_at?.split('T')[0]}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Appointment #{index + 1}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {appointment.transcription && <Badge variant="secondary">Transcribed</Badge>}
                            {appointment.soap_note && <Badge className="bg-green-100 text-green-800">SOAP</Badge>}
                            {appointment.client_summary && <Badge className="bg-blue-100 text-blue-800">Summary</Badge>}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="overview" className="w-full">
                          <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="transcription">Transcription</TabsTrigger>
                            <TabsTrigger value="soap">SOAP Note</TabsTrigger>
                            <TabsTrigger value="summary">Client Summary</TabsTrigger>
                            <TabsTrigger value="dental">🦷 Dental Chart</TabsTrigger>
                          </TabsList>

                          <TabsContent value="overview" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div><strong>Type:</strong> {appointment.appointment_type}</div>
                              <div><strong>Status:</strong> {appointment.status}</div>
                              <div><strong>Date:</strong> {appointment.created_at?.split('T')[0]}</div>
                              <div><strong>Content Status:</strong> 
                                {appointment.transcription && appointment.soap_note && appointment.client_summary 
                                  ? 'Complete' : 'Partial'}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button asChild size="sm">
                                <a href={`/appointments/${appointment.id}/record`}>
                                  📝 Continue Recording
                                </a>
                              </Button>
                              <Button asChild variant="outline" size="sm">
                                <a href={`/appointments/${appointment.id}`}>
                                  👁️ View Details
                                </a>
                              </Button>
                            </div>
                          </TabsContent>

                          <TabsContent value="transcription">
                            {appointment.transcription ? (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">
                                    Transcription ({appointment.transcription.split(' ').length} words)
                                  </span>
                                  <Button 
                                    onClick={() => navigator.clipboard.writeText(appointment.transcription)}
                                    variant="outline" 
                                    size="sm"
                                  >
                                    Copy
                                  </Button>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto text-sm font-mono">
                                  {appointment.transcription}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                <p>No transcription available</p>
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent value="soap">
                            {appointment.soap_note ? (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">Professional SOAP Note</span>
                                  <Button 
                                    onClick={() => navigator.clipboard.writeText(appointment.soap_note)}
                                    variant="outline" 
                                    size="sm"
                                  >
                                    Copy
                                  </Button>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto text-sm">
                                  <pre className="whitespace-pre-wrap">{appointment.soap_note}</pre>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                <p>No SOAP note available</p>
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent value="summary">
                            {appointment.client_summary ? (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">Client Summary</span>
                                  <div className="flex gap-2">
                                    <Button 
                                      onClick={() => navigator.clipboard.writeText(appointment.client_summary)}
                                      variant="outline" 
                                      size="sm"
                                    >
                                      Copy
                                    </Button>
                                    <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                                      <a href="/communication">
                                        <Mail className="h-4 w-4 mr-2" />
                                        Email Client
                                      </a>
                                    </Button>
                                  </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto text-sm">
                                  <pre className="whitespace-pre-wrap">{appointment.client_summary}</pre>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <Mail className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                <p>No client summary available</p>
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent value="dental">
                            {appointment.dental_chart_data ? (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">🦷 AI-Generated Dental Chart</span>
                                  <div className="text-xs text-muted-foreground">
                                    {appointment.dental_chart_data.total_teeth || 0} teeth • {appointment.dental_chart_data.affected_teeth || 0} findings
                                  </div>
                                </div>
                                
                                {/* Dental Chart Visual */}
                                <div className="bg-gray-50 p-6 rounded-lg">
                                  <div className="space-y-8">
                                    {/* Upper Jaw */}
                                    <div className="space-y-4">
                                      <h3 className="text-center font-semibold text-lg">Upper Jaw (Maxilla)</h3>
                                      <div className="flex justify-center gap-8">
                                        {/* Upper Right */}
                                        <div className="space-y-2">
                                          <h4 className="text-center text-sm font-medium text-muted-foreground">Right</h4>
                                          <div className="flex gap-1">
                                            {appointment.dental_chart_data.teeth_layout?.upper_right?.map((toothNum: string) => {
                                              const condition = appointment.dental_chart_data.findings[toothNum]
                                              return (
                                                <div
                                                  key={toothNum}
                                                  className={`w-8 h-8 border-2 rounded flex items-center justify-center text-xs font-bold ${
                                                    condition === 'calculus' ? 'bg-orange-100 border-orange-300' :
                                                    condition === 'gingivitis' ? 'bg-yellow-100 border-yellow-300' :
                                                    condition === 'fracture' ? 'bg-red-100 border-red-300' :
                                                    condition === 'missing' ? 'bg-gray-300 border-gray-500' :
                                                    condition ? 'bg-blue-100 border-blue-300' :
                                                    'bg-green-100 border-green-300'
                                                  }`}
                                                  title={`Tooth ${toothNum}: ${condition || 'normal'}`}
                                                >
                                                  {toothNum.slice(-1)}
                                                </div>
                                              )
                                            }) || []}
                                          </div>
                                        </div>
                                        {/* Upper Left */}
                                        <div className="space-y-2">
                                          <h4 className="text-center text-sm font-medium text-muted-foreground">Left</h4>
                                          <div className="flex gap-1">
                                            {appointment.dental_chart_data.teeth_layout?.upper_left?.map((toothNum: string) => {
                                              const condition = appointment.dental_chart_data.findings[toothNum]
                                              return (
                                                <div
                                                  key={toothNum}
                                                  className={`w-8 h-8 border-2 rounded flex items-center justify-center text-xs font-bold ${
                                                    condition === 'calculus' ? 'bg-orange-100 border-orange-300' :
                                                    condition === 'gingivitis' ? 'bg-yellow-100 border-yellow-300' :
                                                    condition === 'fracture' ? 'bg-red-100 border-red-300' :
                                                    condition === 'missing' ? 'bg-gray-300 border-gray-500' :
                                                    condition ? 'bg-blue-100 border-blue-300' :
                                                    'bg-green-100 border-green-300'
                                                  }`}
                                                  title={`Tooth ${toothNum}: ${condition || 'normal'}`}
                                                >
                                                  {toothNum.slice(-1)}
                                                </div>
                                              )
                                            }) || []}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Lower Jaw */}
                                    <div className="space-y-4">
                                      <h3 className="text-center font-semibold text-lg">Lower Jaw (Mandible)</h3>
                                      <div className="flex justify-center gap-8">
                                        {/* Lower Left */}
                                        <div className="space-y-2">
                                          <h4 className="text-center text-sm font-medium text-muted-foreground">Left</h4>
                                          <div className="flex gap-1">
                                            {appointment.dental_chart_data.teeth_layout?.lower_left?.map((toothNum: string) => {
                                              const condition = appointment.dental_chart_data.findings[toothNum]
                                              return (
                                                <div
                                                  key={toothNum}
                                                  className={`w-8 h-8 border-2 rounded flex items-center justify-center text-xs font-bold ${
                                                    condition === 'calculus' ? 'bg-orange-100 border-orange-300' :
                                                    condition === 'gingivitis' ? 'bg-yellow-100 border-yellow-300' :
                                                    condition === 'fracture' ? 'bg-red-100 border-red-300' :
                                                    condition === 'missing' ? 'bg-gray-300 border-gray-500' :
                                                    condition ? 'bg-blue-100 border-blue-300' :
                                                    'bg-green-100 border-green-300'
                                                  }`}
                                                  title={`Tooth ${toothNum}: ${condition || 'normal'}`}
                                                >
                                                  {toothNum.slice(-1)}
                                                </div>
                                              )
                                            }) || []}
                                          </div>
                                        </div>
                                        {/* Lower Right */}
                                        <div className="space-y-2">
                                          <h4 className="text-center text-sm font-medium text-muted-foreground">Right</h4>
                                          <div className="flex gap-1">
                                            {appointment.dental_chart_data.teeth_layout?.lower_right?.map((toothNum: string) => {
                                              const condition = appointment.dental_chart_data.findings[toothNum]
                                              return (
                                                <div
                                                  key={toothNum}
                                                  className={`w-8 h-8 border-2 rounded flex items-center justify-center text-xs font-bold ${
                                                    condition === 'calculus' ? 'bg-orange-100 border-orange-300' :
                                                    condition === 'gingivitis' ? 'bg-yellow-100 border-yellow-300' :
                                                    condition === 'fracture' ? 'bg-red-100 border-red-300' :
                                                    condition === 'missing' ? 'bg-gray-300 border-gray-500' :
                                                    condition ? 'bg-blue-100 border-blue-300' :
                                                    'bg-green-100 border-green-300'
                                                  }`}
                                                  title={`Tooth ${toothNum}: ${condition || 'normal'}`}
                                                >
                                                  {toothNum.slice(-1)}
                                                </div>
                                              )
                                            }) || []}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Legend */}
                                  <div className="mt-6 pt-4 border-t">
                                    <h4 className="text-sm font-medium mb-3">Legend:</h4>
                                    <div className="flex flex-wrap gap-4 text-xs">
                                      <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                                        <span>Normal</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                                        <span>Gingivitis</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
                                        <span>Calculus</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                                        <span>Fracture</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-gray-300 border border-gray-500 rounded"></div>
                                        <span>Missing</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                                        <span>Other</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Findings Summary */}
                                {appointment.dental_chart_data.findings && Object.keys(appointment.dental_chart_data.findings).length > 0 && (
                                  <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-2">Dental Findings:</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                      {Object.entries(appointment.dental_chart_data.findings).map(([tooth, condition]) => (
                                        <li key={tooth}>
                                          <span className="font-medium">
                                            {tooth === 'general' ? 'General' : `Tooth ${tooth}`}:
                                          </span> {condition as string}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Recommendations */}
                                {appointment.dental_chart_data.recommendations && (
                                  <div className="bg-yellow-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-2">Treatment Recommendations:</h4>
                                    <div className="space-y-2">
                                      {appointment.dental_chart_data.recommendations.map((rec: any, index: number) => (
                                        <div key={index} className="flex items-start gap-2">
                                          <div className={`w-2 h-2 rounded-full mt-2 ${
                                            rec.urgency === 'high' ? 'bg-red-500' :
                                            rec.urgency === 'medium' ? 'bg-yellow-500' :
                                            'bg-green-500'
                                          }`}></div>
                                          <div className="text-sm">
                                            <div className="font-medium">{rec.type}</div>
                                            <div className="text-muted-foreground">{rec.description}</div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <div className="text-4xl mb-4">🦷</div>
                                <p>No dental chart available for this appointment</p>
                                <p className="text-sm mt-2">Dental charts are generated when dental keywords are detected in SOAP notes</p>
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Patient Dialog */}
      <Dialog open={isEditingPatient} onOpenChange={setIsEditingPatient}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Patient: {editingPatient?.name}</DialogTitle>
          </DialogHeader>
          {editingPatient && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="edit-patient-name">Patient Name</Label>
                  <Input
                    id="edit-patient-name"
                    value={editingPatient.name || ''}
                    onChange={(e) => setEditingPatient({ ...editingPatient, name: e.target.value })}
                    placeholder="e.g., Buddy"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-species">Species</Label>
                  <Select
                    value={editingPatient.species || 'Dog'}
                    onValueChange={(value) => setEditingPatient({ ...editingPatient, species: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select species" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dog">Dog</SelectItem>
                      <SelectItem value="Cat">Cat</SelectItem>
                      <SelectItem value="Bird">Bird</SelectItem>
                      <SelectItem value="Rabbit">Rabbit</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-breed">Breed</Label>
                  <Input
                    id="edit-breed"
                    value={editingPatient.breed || ''}
                    onChange={(e) => setEditingPatient({ ...editingPatient, breed: e.target.value })}
                    placeholder="e.g., Golden Retriever"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-age">Age</Label>
                  <Input
                    id="edit-age"
                    value={editingPatient.age || ''}
                    onChange={(e) => setEditingPatient({ ...editingPatient, age: e.target.value })}
                    placeholder="e.g., 5 years"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-sex">Sex</Label>
                  <Select
                    value={editingPatient.sex || ''}
                    onValueChange={(value) => setEditingPatient({ ...editingPatient, sex: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Male Neutered">Male Neutered</SelectItem>
                      <SelectItem value="Female Spayed">Female Spayed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-weight">Weight</Label>
                  <Input
                    id="edit-weight"
                    value={editingPatient.weight || ''}
                    onChange={(e) => setEditingPatient({ ...editingPatient, weight: e.target.value })}
                    placeholder="e.g., 45 lbs"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Owner Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="edit-owner-name">Owner Name</Label>
                    <Input
                      id="edit-owner-name"
                      value={editingPatient.owner || ''}
                      onChange={(e) => setEditingPatient({ ...editingPatient, owner: e.target.value })}
                      placeholder="e.g., John Smith"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-owner-phone">Phone</Label>
                    <Input
                      id="edit-owner-phone"
                      value={editingPatient.owner_phone || ''}
                      onChange={(e) => setEditingPatient({ ...editingPatient, owner_phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-owner-email">Email</Label>
                    <Input
                      id="edit-owner-email"
                      type="email"
                      value={editingPatient.owner_email || ''}
                      onChange={(e) => setEditingPatient({ ...editingPatient, owner_email: e.target.value })}
                      placeholder="owner@email.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <Input
                  id="edit-notes"
                  value={editingPatient.notes || ''}
                  onChange={(e) => setEditingPatient({ ...editingPatient, notes: e.target.value })}
                  placeholder="Additional notes about the patient"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditingPatient(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} className="bg-primary hover:bg-primary/90">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
