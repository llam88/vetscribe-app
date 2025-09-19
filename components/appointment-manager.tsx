"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CalendarDays, FileText, Mail, Eye, Edit, Trash2, Download, Send, Plus, Search, Filter, MoreHorizontal, CheckCircle2, Mic } from "lucide-react"
import { createClientBrowser } from "@/lib/supabase-browser"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Appointment {
  id: string
  patient_name: string
  owner_name: string
  species: string
  breed?: string
  appointment_type: string
  created_at: string
  transcription?: string
  soap_note?: string
  client_summary?: string
  user_id: string
  status: 'pending' | 'in_progress' | 'completed' | 'reviewed'
}

export function AppointmentManager() {
  const sb = createClientBrowser()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [showNewForm, setShowNewForm] = useState(false)
  
  // New appointment form
  const [newAppointment, setNewAppointment] = useState({
    patient_name: "",
    owner_name: "",
    species: "Dog",
    breed: "",
    appointment_type: "Wellness Exam",
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: "09:00",
    notes: ""
  })

  const loadAppointments = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await sb.auth.getUser()
      if (!user) return

      const { data, error } = await sb
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Appointments table may not exist yet:', error)
        setAppointments([])
        return
      }
      setAppointments(data || [])
    } catch (error) {
      console.warn('Error loading appointments - table may not exist:', error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const saveAppointment = async () => {
    try {
      const { data: { user } } = await sb.auth.getUser()
      if (!user) {
        alert('❌ Please sign in first')
        return
      }

      // Prepare appointment data with exact field mapping
      const appointmentData = {
        user_id: user.id,
        patient_name: newAppointment.patient_name,
        owner_name: newAppointment.owner_name,
        species: newAppointment.species,
        breed: newAppointment.breed,
        appointment_type: newAppointment.appointment_type,
        chief_complaint: newAppointment.notes, // Map notes to chief_complaint
        status: 'pending'
      }

      console.log('Attempting to save appointment:', appointmentData)

      const { data, error } = await sb
        .from('appointments')
        .insert(appointmentData)
        .select()
      
      if (error) {
        console.error('Detailed Supabase error:', error)
        if (error.message.includes('relation "public.appointments" does not exist')) {
          alert('⚠️ Database tables need to be created first. Please check the setup notice on the dashboard.')
          return
        }
        if (error.message.includes('RLS')) {
          alert('⚠️ Database permissions issue. Please check your RLS policies.')
          return
        }
        alert(`❌ Database error: ${error.message}`)
        return
      }

      console.log('Appointment saved successfully:', data)

      // Auto-create patient record if it doesn't exist
      try {
        console.log('Checking if patient exists:', newAppointment.patient_name)
        
        const { data: existingPatients, error: searchError } = await sb
          .from('patients')
          .select('id, name')
          .eq('name', newAppointment.patient_name)
          .eq('user_id', user.id)
          .limit(1)
        
        if (searchError) {
          console.warn('Error searching for existing patient:', searchError)
          // Continue anyway to try creating the patient
        }
        
        if (!existingPatients || existingPatients.length === 0) {
          console.log('Patient not found, creating new patient record')
          
          const patientData = {
            user_id: user.id,
            name: newAppointment.patient_name.trim(),
            owner: newAppointment.owner_name?.trim() || 'Unknown Owner',
            species: newAppointment.species,
            breed: newAppointment.breed?.trim() || '',
            notes: `Auto-created from appointment: ${newAppointment.appointment_type}`,
            created_at: new Date().toISOString()
          }
          
          console.log('Creating patient with data:', patientData)
          
          const { data: newPatient, error: patientError } = await sb
            .from('patients')
            .insert(patientData)
            .select()
          
          if (patientError) {
            console.error('Failed to auto-create patient - detailed error:', patientError)
            alert(`⚠️ Appointment saved but patient creation failed: ${patientError.message}`)
          } else {
            console.log('✅ Patient auto-created successfully:', newPatient[0])
            alert('✅ Appointment saved and patient profile created!')
          }
        } else {
          console.log('Patient already exists:', existingPatients[0])
          alert('✅ Appointment saved and linked to existing patient!')
        }
      } catch (patientError) {
        console.error('Patient auto-creation failed with exception:', patientError)
        alert(`⚠️ Appointment saved but patient creation failed: ${patientError}`)
      }

      // Reset form
      setNewAppointment({
        patient_name: "",
        owner_name: "",
        species: "Dog",
        breed: "",
        appointment_type: "Wellness Exam",
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: "09:00",
        notes: ""
      })
      setShowNewForm(false)
      loadAppointments()
      alert('✅ Appointment saved successfully! Patient record updated.')
      
    } catch (error) {
      console.error('Error saving appointment:', error)
      alert('❌ Unexpected error saving appointment. Check console for details.')
    }
  }

  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await sb.from('appointments').delete().eq('id', id)
      if (error) throw error
      loadAppointments()
    } catch (error) {
      console.error('Error deleting appointment:', error)
    }
  }

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    try {
      const { error } = await sb
        .from('appointments')
        .update({ status })
        .eq('id', id)
      
      if (error) throw error
      loadAppointments()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const generateClientEmail = async (appointment: Appointment) => {
    if (!appointment.client_summary) {
      alert('Generate a client summary first')
      return
    }

    try {
      const emailContent = `Dear ${appointment.owner_name},

Thank you for bringing ${appointment.patient_name} in for their ${appointment.appointment_type.toLowerCase()} appointment.

${appointment.client_summary}

If you have any questions or concerns, please don't hesitate to contact us.

Best regards,
Your Veterinary Team`

      // Create mailto link
      const subject = `${appointment.patient_name}'s Visit Summary`
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailContent)}`
      window.open(mailtoLink)
    } catch (error) {
      console.error('Error generating email:', error)
    }
  }

  const exportToPDF = async (appointment: Appointment, type: 'soap' | 'summary') => {
    const content = type === 'soap' ? appointment.soap_note : appointment.client_summary
    if (!content) return

    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${appointment.patient_name} - ${type === 'soap' ? 'SOAP Note' : 'Visit Summary'}`,
          content
        })
      })
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${appointment.patient_name}_${type}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting PDF:', error)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [])

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.species.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterType === 'all' || appointment.appointment_type === filterType ||
                         (filterType === 'completed' && appointment.status === 'completed') ||
                         (filterType === 'pending' && appointment.status === 'pending')
    
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'reviewed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getCompletionBadge = (appointment: Appointment) => {
    const hasTranscription = !!appointment.transcription
    const hasSoap = !!appointment.soap_note
    const hasSummary = !!appointment.client_summary
    
    if (hasTranscription && hasSoap && hasSummary) {
      return <Badge className="bg-green-100 text-green-800">Complete</Badge>
    } else if (hasTranscription && hasSoap) {
      return <Badge className="bg-blue-100 text-blue-800">SOAP Ready</Badge>
    } else if (hasTranscription) {
      return <Badge className="bg-yellow-100 text-yellow-800">Transcribed</Badge>
    } else {
      return <Badge variant="secondary">Pending</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Appointment Management</h1>
          <p className="text-muted-foreground">
            {appointments.length} total appointments • {filteredAppointments.length} showing
          </p>
        </div>
        <Button 
          onClick={() => setShowNewForm(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients, owners, or species..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Appointments</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="Wellness Exam">Wellness Exams</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
                <SelectItem value="Surgery">Surgery</SelectItem>
                <SelectItem value="Dental">Dental</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No appointments found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterType !== 'all' 
                  ? 'No appointments match your search criteria' 
                  : 'Create your first appointment to get started'}
              </p>
              <Button onClick={() => setShowNewForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Appointment
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{appointment.patient_name}</h3>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                      {getCompletionBadge(appointment)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
                      <div>
                        <strong>Owner:</strong> {appointment.owner_name}
                      </div>
                      <div>
                        <strong>Species:</strong> {appointment.species}
                      </div>
                      <div>
                        <strong>Type:</strong> {appointment.appointment_type}
                      </div>
                      <div>
                        <strong>Date:</strong> {appointment.created_at?.split('T')[0] || 'No date'}
                      </div>
                    </div>

                    {/* Progress Indicators */}
                    <div className="flex items-center gap-4 text-xs">
                      <div className={`flex items-center gap-1 ${appointment.transcription ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle2 className="h-3 w-3" />
                        Transcribed
                      </div>
                      <div className={`flex items-center gap-1 ${appointment.soap_note ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle2 className="h-3 w-3" />
                        SOAP Note
                      </div>
                      <div className={`flex items-center gap-1 ${appointment.client_summary ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle2 className="h-3 w-3" />
                        Client Summary
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {/* Primary action: Record if not started, Continue if in progress */}
                    {!appointment.transcription ? (
                      <Button 
                        asChild
                        size="sm"
                        className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto"
                      >
                        <a href={`/appointments/${appointment.id}/record`}>
                          <Mic className="h-4 w-4 mr-2" />
                          {appointment.status === 'pending' ? 'Start Recording' : 'Continue'}
                        </a>
                      </Button>
                    ) : (
                      <Button 
                        asChild
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        <a href={`/appointments/${appointment.id}/record`}>
                          <FileText className="h-4 w-4 mr-2" />
                          Review
                        </a>
                      </Button>
                    )}
                    
                    {/* Secondary actions - keep horizontal on mobile */}
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <Button 
                        asChild
                        variant="ghost" 
                        size="sm"
                      >
                        <a href={`/appointments/${appointment.id}`}>
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                      
                      <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Appointment Actions</DialogTitle>
                          <DialogDescription>
                            Choose an action for {appointment.patient_name}'s appointment
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                          <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        asChild
                      >
                        <a href={`/appointments/${appointment.id}/record`}>
                          <Mic className="h-4 w-4 mr-2" />
                          {appointment.transcription ? 'Review Recording' : 'Start Recording'}
                        </a>
                      </Button>
                      
                      {appointment.soap_note && (
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => exportToPDF(appointment, 'soap')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export SOAP Note PDF
                        </Button>
                      )}
                          {appointment.client_summary && (
                            <>
                              <Button 
                                variant="outline" 
                                className="w-full justify-start"
                                onClick={() => exportToPDF(appointment, 'summary')}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Export Summary PDF
                              </Button>
                              <Button 
                                variant="outline" 
                                className="w-full justify-start"
                                onClick={() => generateClientEmail(appointment)}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Send Client Email
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Mark Complete
                          </Button>
                          <Button 
                            variant="destructive" 
                            className="w-full justify-start"
                            onClick={() => deleteAppointment(appointment.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Appointment
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* New Appointment Dialog */}
      <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Appointment</DialogTitle>
            <DialogDescription>
              Add a new appointment to your schedule
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patient_name">Patient Name *</Label>
                <Input
                  id="patient_name"
                  value={newAppointment.patient_name}
                  onChange={(e) => setNewAppointment(prev => ({...prev, patient_name: e.target.value}))}
                  placeholder="Enter patient name"
                />
              </div>
              <div>
                <Label htmlFor="owner_name">Owner Name</Label>
                <Input
                  id="owner_name"
                  value={newAppointment.owner_name}
                  onChange={(e) => setNewAppointment(prev => ({...prev, owner_name: e.target.value}))}
                  placeholder="Enter owner name"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="appointment_date">Appointment Date</Label>
                <Input
                  id="appointment_date"
                  type="date"
                  value={newAppointment.appointment_date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setNewAppointment(prev => ({...prev, appointment_date: e.target.value}))}
                />
              </div>
              <div>
                <Label htmlFor="appointment_time">Appointment Time</Label>
                <Input
                  id="appointment_time"
                  type="time"
                  value={newAppointment.appointment_time || "09:00"}
                  onChange={(e) => setNewAppointment(prev => ({...prev, appointment_time: e.target.value}))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="species">Species</Label>
                <Select 
                  value={newAppointment.species} 
                  onValueChange={(value) => setNewAppointment(prev => ({...prev, species: value}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dog">Dog</SelectItem>
                    <SelectItem value="Cat">Cat</SelectItem>
                    <SelectItem value="Bird">Bird</SelectItem>
                    <SelectItem value="Rabbit">Rabbit</SelectItem>
                    <SelectItem value="Reptile">Reptile</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="breed">Breed</Label>
                <Input
                  id="breed"
                  value={newAppointment.breed}
                  onChange={(e) => setNewAppointment(prev => ({...prev, breed: e.target.value}))}
                  placeholder="Enter breed"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="appointment_type">Appointment Type</Label>
              <Select 
                value={newAppointment.appointment_type} 
                onValueChange={(value) => setNewAppointment(prev => ({...prev, appointment_type: value}))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Wellness Exam">Wellness Exam</SelectItem>
                  <SelectItem value="Sick Visit">Sick Visit</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="Surgery Consultation">Surgery Consultation</SelectItem>
                  <SelectItem value="Dental Cleaning">Dental Cleaning</SelectItem>
                  <SelectItem value="Vaccination">Vaccination</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment(prev => ({...prev, notes: e.target.value}))}
                placeholder="Additional notes or chief complaint..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewForm(false)}>
              Cancel
            </Button>
            <Button onClick={saveAppointment} disabled={!newAppointment.patient_name}>
              Create Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appointment Details Dialog */}
      {selectedAppointment && (
        <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedAppointment.patient_name}'s Appointment
                {getCompletionBadge(selectedAppointment)}
              </DialogTitle>
              <DialogDescription>
                {selectedAppointment.appointment_type} • {selectedAppointment.created_at?.split('T')[0] || 'No date'}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="transcription">Transcription</TabsTrigger>
                <TabsTrigger value="soap">SOAP Note</TabsTrigger>
                <TabsTrigger value="summary">Client Summary</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Patient:</strong> {selectedAppointment.patient_name}</div>
                  <div><strong>Owner:</strong> {selectedAppointment.owner_name}</div>
                  <div><strong>Species:</strong> {selectedAppointment.species}</div>
                  <div><strong>Breed:</strong> {selectedAppointment.breed || 'Not specified'}</div>
                  <div><strong>Type:</strong> {selectedAppointment.appointment_type}</div>
                  <div><strong>Date:</strong> {new Date(selectedAppointment.created_at).toLocaleString()}</div>
                </div>
              </TabsContent>
              
              <TabsContent value="transcription">
                {selectedAppointment.transcription ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm">{selectedAppointment.transcription}</pre>
                    </div>
                    <Button variant="outline" onClick={() => navigator.clipboard.writeText(selectedAppointment.transcription!)}>
                      Copy Transcription
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No transcription available</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="soap">
                {selectedAppointment.soap_note ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm">{selectedAppointment.soap_note}</pre>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => navigator.clipboard.writeText(selectedAppointment.soap_note!)}>
                        Copy SOAP Note
                      </Button>
                      <Button variant="outline" onClick={() => exportToPDF(selectedAppointment, 'soap')}>
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No SOAP note available</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="summary">
                {selectedAppointment.client_summary ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm">{selectedAppointment.client_summary}</pre>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => navigator.clipboard.writeText(selectedAppointment.client_summary!)}>
                        Copy Summary
                      </Button>
                      <Button variant="outline" onClick={() => exportToPDF(selectedAppointment, 'summary')}>
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                      </Button>
                      <Button onClick={() => generateClientEmail(selectedAppointment)}>
                        <Mail className="h-4 w-4 mr-2" />
                        Send to Client
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No client summary available</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
