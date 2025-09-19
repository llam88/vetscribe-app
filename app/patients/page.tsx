import { redirect } from "next/navigation"
import { createClientServer } from "@/lib/supabase-server"
import PatientsForm from "@/components/PatientsForm"
import PatientsTable from "@/components/PatientsTable"
import { NavigationBreadcrumb } from "@/components/navigation-breadcrumb"
import { MainNavigation } from "@/components/main-navigation"

export default async function PatientsPage() {
  const sb = await createClientServer()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect("/sign-in")

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="p-6 max-w-5xl mx-auto">
        <NavigationBreadcrumb currentPage="Patient Management" />
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Patient Management</h1>
          <p className="text-muted-foreground">
            Manage your patient database and medical records
          </p>
        </div>
        <div className="space-y-6">
          <PatientsForm />
          <PatientsTable />
        </div>
      </div>
    </div>
  )
}
