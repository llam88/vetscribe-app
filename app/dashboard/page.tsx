import { redirect } from "next/navigation"
import { createClientServer } from "@/lib/supabase-server"
import { DashboardOverview } from "@/components/dashboard-overview"
import { TrialOnboarding } from "@/components/trial-onboarding"
import { MainNavigation } from "@/components/main-navigation"
import { DatabaseSetupNotice } from "@/components/database-setup-notice"

export default async function Dashboard() {
  const sb = await createClientServer()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect("/sign-in")

  // Get dashboard data from Supabase (with fallback for missing tables)
  let appointments = []
  let patients = []
  
  try {
    const [appointmentsResult, patientsResult] = await Promise.all([
      sb.from('appointments').select('*').order('created_at', { ascending: false }).limit(10),
      sb.from('patients').select('*').order('created_at', { ascending: false })
    ])
    
    appointments = appointmentsResult.data || []
    patients = patientsResult.data || []
  } catch (error) {
    console.warn('Database tables may not exist yet - using empty data for now')
    appointments = []
    patients = []
  }

  // Calculate statistics
  const stats = {
    totalAppointments: appointments.length,
    totalPatients: patients.length,
    todayAppointments: appointments.filter(apt => {
      const today = new Date().toDateString()
      return new Date(apt.created_at).toDateString() === today
    }).length,
    recentActivity: appointments.slice(0, 5)
  }

  // Check if user is new (created recently)
  const isNewUser = user && new Date(user.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Created within last 24 hours
  const hasContent = appointments.length > 0 || patients.length > 0

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="p-6 max-w-7xl mx-auto">
        {/* Database Setup Notice */}
        <DatabaseSetupNotice />
        
        {/* Show onboarding for new users or users without content */}
        {(isNewUser || !hasContent) && (
          <div className="mb-8">
            <TrialOnboarding 
              userEmail={user.email}
              appointments={appointments}
              completedSteps={[
                ...(appointments.length > 0 ? ['record'] : []),
                ...(patients.length > 0 ? ['patient'] : []),
                ...(appointments.length > 0 ? ['appointment'] : []),
                ...(appointments.some(a => a.soap_note) ? ['communication'] : []),
              ]}
            />
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">SwiftVet Dashboard</h1>
          <p className="text-muted-foreground">Professional Veterinary Scribe - Transform Your Documentation</p>
        </div>

        {/* Today's Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <a 
            href="/appointments" 
            className="group relative overflow-hidden rounded-lg border bg-gradient-to-r from-blue-50 to-blue-100 p-6 hover:shadow-lg transition-all hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-500 p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Create Appointment</h3>
                <p className="text-sm text-blue-700">Schedule a new patient visit</p>
              </div>
            </div>
          </a>

          <a 
            href="/appointments"
            className="group relative overflow-hidden rounded-lg border bg-gradient-to-r from-red-50 to-red-100 p-6 hover:shadow-lg transition-all hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-red-500 p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-red-900">Start Recording</h3>
                <p className="text-sm text-red-700">Record appointments and generate documentation</p>
              </div>
            </div>
          </a>

          <a 
            href="/communication" 
            className="group relative overflow-hidden rounded-lg border bg-gradient-to-r from-green-50 to-green-100 p-6 hover:shadow-lg transition-all hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-500 p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Client Communication</h3>
                <p className="text-sm text-green-700">Generate and send professional emails to pet owners</p>
              </div>
            </div>
          </a>
        </div>

        <DashboardOverview appointments={appointments} patients={patients} stats={stats} />
      </div>
    </div>
  )
}
