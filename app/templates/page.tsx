import { redirect } from "next/navigation"
import { createClientServer } from "@/lib/supabase-server"
import { SOAPTemplateManager } from "@/components/soap-template-manager"
import { NavigationBreadcrumb } from "@/components/navigation-breadcrumb"
import { MainNavigation } from "@/components/main-navigation"

export default async function TemplatesPage() {
  const sb = await createClientServer()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect("/sign-in")

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="p-6 max-w-6xl mx-auto">
        <NavigationBreadcrumb currentPage="SOAP Templates" />
        <SOAPTemplateManager />
      </div>
    </div>
  )
}