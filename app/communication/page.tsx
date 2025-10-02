import { redirect } from "next/navigation"
import { createClientServer } from "@/lib/supabase-server"
import { MainNavigation } from "@/components/main-navigation"
import { SMSCommunicationTab } from "@/components/sms-communication-tab"

export default async function CommunicationPage() {
  const sb = await createClientServer()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect("/sign-in")

  // Get appointments with owner contact info (fresh data every time)
  let appointments = []
  
  try {
    const { data, error } = await sb
      .from('appointments')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false }) // Order by updated_at to show recent changes first
    
    appointments = data || []
    console.log('📧 Communication tab loaded appointments:', appointments.length)
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