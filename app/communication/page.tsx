import { redirect } from "next/navigation"
import { createClientServer } from "@/lib/supabase-server"
import { ClientCommunicationHub } from "@/components/client-communication-hub"
import { NavigationBreadcrumb } from "@/components/navigation-breadcrumb"
import { MainNavigation } from "@/components/main-navigation"

export default async function CommunicationPage() {
  const sb = await createClientServer()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect("/sign-in")

  // Get appointments with SOAP notes for email generation (with fallback)
  let appointments = []
  try {
    const { data } = await sb
      .from('appointments')
      .select('*')
      .eq('user_id', user.id)
      .not('soap_note', 'is', null)
      .order('created_at', { ascending: false })
    
    appointments = data || []
  } catch (error) {
    console.warn('Appointments table may not exist yet')
    appointments = []
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="p-6 max-w-5xl mx-auto">
        <NavigationBreadcrumb currentPage="Client Communication" />
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Client Communication</h1>
          <p className="text-muted-foreground">
            Generate and send professional emails to pet owners based on appointment notes
          </p>
        </div>
        <ClientCommunicationHub appointments={appointments || []} />
      </div>
    </div>
  )
}
