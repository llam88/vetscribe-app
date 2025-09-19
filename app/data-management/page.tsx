import { DataManagementSystem } from "@/components/data-management-system"
import { Header } from "@/components/header"

export default function DataManagementPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <DataManagementSystem />
      </main>
    </div>
  )
}
