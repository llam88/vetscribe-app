import { redirect, notFound } from "next/navigation"
import { createClientServer } from "@/lib/supabase-server"
import { AppointmentSummary } from "@/components/appointment-summary"
import { MainNavigation } from "@/components/main-navigation"
import { NavigationBreadcrumb } from "@/components/navigation-breadcrumb"

export default async function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const sb = await createClientServer()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect("/sign-in")

  // Get the specific appointment with all data
  const { data: appointment, error } = await sb
    .from('appointments')
    .select('*')
    .eq('id', resolvedParams.id)
    .eq('user_id', user.id)
    .single()

  if (error || !appointment) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="p-6 max-w-5xl mx-auto">
        <NavigationBreadcrumb 
          currentPage={`${appointment.patient_name}'s Record`}
          parentPage={{ name: "Appointments", href: "/appointments" }}
        />
        <AppointmentSummary appointment={appointment} />
      </div>
    </div>
  )
}
