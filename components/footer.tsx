import { Stethoscope } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Stethoscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">SwiftVet</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered veterinary notes that save time and improve accuracy. Focus on what matters most - your patients.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Core Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/appointments" className="hover:text-foreground transition-colors">
                  📅 Appointments & Recording
                </Link>
              </li>
              <li>
                <Link href="/patients" className="hover:text-foreground transition-colors">
                  🐕 Patient Management
                </Link>
              </li>
              <li>
                <Link href="/communication" className="hover:text-foreground transition-colors">
                  📧 Client Communication
                </Link>
              </li>
              <li>
                <Link href="/notes" className="hover:text-foreground transition-colors">
                  📝 SOAP Notes & Charts
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Get Started</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/sign-in" className="hover:text-foreground transition-colors">
                  🚀 Start Free Beta
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-foreground transition-colors">
                  ❓ How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-foreground transition-colors">
                  ⭐ Features Overview
                </a>
              </li>
              <li>
                <Link href="/sign-in" className="hover:text-foreground transition-colors">
                  🔑 Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">© 2024 SwiftVet. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
              <span className="text-xs text-muted-foreground">Made with ❤️ for veterinarians</span>
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-xs text-green-600 font-medium">
              🚀 FREE BETA - Early adopters get 50% off for life!
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
