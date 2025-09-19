"use client"
import { ClientEmailComposer } from "@/components/client-email-composer"
import { Header } from "@/components/header"

export default function EmailPage() {
  // Mock data - in a real app, this would come from URL params or API
  const mockData = {
    patientName: "Buddy",
    ownerName: "John Smith",
    ownerEmail: "john.smith@email.com",
    visitType: "Wellness Exam",
    visitDate: "January 15, 2024",
    notes: "Annual wellness examination completed. Patient is healthy with no concerns.",
  }

  const handleSendEmail = (emailData: any) => {
    console.log("Sending email:", emailData)
    // In a real app, this would send the email via API
    alert("Email sent successfully!")
  }

  const handleSaveEmail = (emailData: any) => {
    console.log("Saving email draft:", emailData)
    // In a real app, this would save the draft via API
    alert("Email draft saved!")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ClientEmailComposer {...mockData} onSend={handleSendEmail} onSave={handleSaveEmail} />
      </main>
    </div>
  )
}
