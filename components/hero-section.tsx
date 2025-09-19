import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, FileText, Mail } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Beta Banner */}
          <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge className="bg-green-100 text-green-800">
                🚀 FREE BETA
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                Limited Time
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-700">
              VetScribe is <strong>completely free</strong> during beta. Pricing starts at $79/month later.
            </p>
            <p className="text-xs text-gray-600 mt-1">
              <strong>Early adopters lock in 50% off for life!</strong> Sign up now to secure founder pricing.
            </p>
          </div>

          <Badge variant="secondary" className="mb-6 bg-accent/10 text-accent hover:bg-accent/20">
            AI-Powered Veterinary Notes
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl text-balance">
            Type less. <span className="text-primary">Heal more.</span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-muted-foreground text-pretty max-w-2xl mx-auto">
            Fast, accurate AI-powered notes for veterinary appointments. Record conversations and get professionally
            formatted notes in seconds.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4" asChild>
              <a href="/sign-in">
                🚀 Start Free Beta Access
                <span className="ml-2 text-sm">→</span>
              </a>
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-4" asChild>
              <a href="#how-it-works">
                See How It Works
              </a>
            </Button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ✅ No credit card required • ✅ Full feature access • ✅ Cancel anytime
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Join <strong>500+ veterinarians</strong> already using VetScribe
            </p>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex items-center justify-center gap-8 opacity-60">
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 bg-muted rounded"></div>
              <span className="text-sm text-muted-foreground">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 bg-muted rounded"></div>
              <span className="text-sm text-muted-foreground">SOC 2 Certified</span>
            </div>
          </div>
        </div>

        {/* Hero illustration */}
        <div className="mt-16 flex justify-center">
          <div className="relative">
            <img
              src="/vetscribe-hero.png"
              alt="VetScribe - Veterinarian using AI-powered veterinary notes system with patient"
              className="h-96 w-auto rounded-2xl shadow-2xl border"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
