import { redirect } from "next/navigation"
import { createClientServer } from "@/lib/supabase-server"
import { AppointmentManager } from "@/components/appointment-manager"
import { NavigationBreadcrumb } from "@/components/navigation-breadcrumb"
import { MainNavigation } from "@/components/main-navigation"

export default async function AppointmentsPage() {
  const sb = await createClientServer()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect("/sign-in")

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="p-6 max-w-7xl mx-auto">
        <NavigationBreadcrumb currentPage="Appointments" />
        <AppointmentManager />
        
        {/* Quick Actions */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <a 
            href="/record" 
            className="block p-4 border rounded-lg hover:bg-gray-50 text-center"
          >
            <div className="text-2xl mb-2">🎙️</div>
            <h3 className="font-medium">Start Recording</h3>
            <p className="text-sm text-muted-foreground">Record a new appointment</p>
          </a>
          
          <a 
            href="/patients" 
            className="block p-4 border rounded-lg hover:bg-gray-50 text-center"
          >
            <div className="text-2xl mb-2">👤</div>
            <h3 className="font-medium">Add Patient</h3>
            <p className="text-sm text-muted-foreground">Register new patient</p>
          </a>
          
          <a 
            href="/communication" 
            className="block p-4 border rounded-lg hover:bg-gray-50 text-center"
          >
            <div className="text-2xl mb-2">📧</div>
            <h3 className="font-medium">Send Emails</h3>
            <p className="text-sm text-muted-foreground">Client communication</p>
          </a>
        </div>
      </div>
    </div>
  )
}
