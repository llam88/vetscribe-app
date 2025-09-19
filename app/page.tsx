import { Header } from "@/components/header"
import { LandingPageOptimized } from "@/components/landing-page-optimized"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <LandingPageOptimized />
      </main>
      <Footer />
    </div>
  )
}
