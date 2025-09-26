import { redirect } from "next/navigation"
import { createClientServer } from "@/lib/supabase-server"
import { MainNavigation } from "@/components/main-navigation"
import { SMSCommunicationTab } from "@/components/sms-communication-tab"

export default async function CommunicationPage() {
  const sb = await createClientServer()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect("/sign-in")

  // Get appointments with owner contact info
  let appointments = []
  
  try {
    const { data, error } = await sb
      .from('appointments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    appointments = data || []
  } catch (error) {
    console.warn('Appointments table may not exist yet:', error)
    appointments = []
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="p-6 max-w-6xl mx-auto">
        <SMSCommunicationTab appointments={appointments} />
      </div>
    </div>
  )
}