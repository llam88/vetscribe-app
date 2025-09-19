import { redirect } from "next/navigation"
import { createClientServer } from "@/lib/supabase-server"
import { SettingsManager } from "@/components/settings-manager"
import { NavigationBreadcrumb } from "@/components/navigation-breadcrumb"
import { MainNavigation } from "@/components/main-navigation"

export default async function SettingsPage() {
  const sb = await createClientServer()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect("/sign-in")

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="p-6 max-w-4xl mx-auto">
        <NavigationBreadcrumb currentPage="Settings" />
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">⚙️ Settings</h1>
          <p className="text-muted-foreground">
            Configure your SwiftVet experience and experimental features
          </p>
        </div>

        <SettingsManager />
      </div>
    </div>
  )
}
