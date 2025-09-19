import { redirect } from "next/navigation"
import { createClientServer } from "@/lib/supabase-server"
import RecordUpload from "@/components/RecordUpload"
import { NavigationBreadcrumb } from "@/components/navigation-breadcrumb"
import { MainNavigation } from "@/components/main-navigation"

export default async function RecordPage() {
  const sb = await createClientServer()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect("/sign-in")

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="p-6 max-w-4xl mx-auto">
        <NavigationBreadcrumb currentPage="Record & Transcribe" />
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Record & Transcribe</h1>
          <p className="text-muted-foreground">
            Record appointments and generate professional veterinary documentation
          </p>
        </div>
        <RecordUpload />
      </div>
    </div>
  )
}
