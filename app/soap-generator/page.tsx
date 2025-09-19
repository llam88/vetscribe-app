import { SoapNotesGenerator } from "@/components/soap-notes-generator"
import { Header } from "@/components/header"

export default function SoapGeneratorPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <SoapNotesGenerator />
      </main>
    </div>
  )
}
