import { redirect } from "next/navigation"
import { createClientServer } from "@/lib/supabase-server"
import { MainNavigation } from "@/components/main-navigation"
import { NavigationBreadcrumb } from "@/components/navigation-breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Users, Eye } from "lucide-react"

export default async function NotesPage() {
  const sb = await createClientServer()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect("/sign-in")

  // Get real appointments data
  let appointments = []
  try {
    const { data } = await sb
      .from('appointments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    appointments = data || []
  } catch (error) {
    console.warn('Could not load appointments')
    appointments = []
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="p-6 max-w-6xl mx-auto">
        <NavigationBreadcrumb currentPage="Appointment Notes" />
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Appointment Notes & Documentation</h1>
          <p className="text-muted-foreground">
            View and manage all your appointment documentation
          </p>
        </div>

        {appointments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No appointment notes yet</h3>
              <p className="text-muted-foreground mb-4">
                Create appointments and generate documentation to see them here
              </p>
              <Button asChild>
                <a href="/appointments">Create First Appointment</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment: any) => (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{appointment.patient_name}</h3>
                        <Badge className={
                          appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {appointment.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
                        <div><strong>Owner:</strong> {appointment.owner_name}</div>
                        <div><strong>Species:</strong> {appointment.species}</div>
                        <div><strong>Type:</strong> {appointment.appointment_type}</div>
                        <div><strong>Date:</strong> {appointment.created_at?.split('T')[0]}</div>
                      </div>

                      {/* Content Status */}
                      <div className="flex items-center gap-4 text-xs">
                        <div className={`flex items-center gap-1 ${appointment.transcription ? 'text-green-600' : 'text-gray-400'}`}>
                          <FileText className="h-3 w-3" />
                          Transcription {appointment.transcription ? '✅' : '❌'}
                        </div>
                        <div className={`flex items-center gap-1 ${appointment.soap_note ? 'text-green-600' : 'text-gray-400'}`}>
                          <FileText className="h-3 w-3" />
                          SOAP Note {appointment.soap_note ? '✅' : '❌'}
                        </div>
                        <div className={`flex items-center gap-1 ${appointment.client_summary ? 'text-green-600' : 'text-gray-400'}`}>
                          <FileText className="h-3 w-3" />
                          Client Summary {appointment.client_summary ? '✅' : '❌'}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm">
                        <a href={`/appointments/${appointment.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </a>
                      </Button>
                      
                      <Button asChild size="sm">
                        <a href={`/appointments/${appointment.id}/record`}>
                          {appointment.transcription ? 'Edit' : 'Record'}
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <div className="text-center pt-4">
              <Button asChild variant="outline">
                <a href="/appointments">
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage All Appointments
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
