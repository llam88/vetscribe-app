import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Mic, 
  FileText, 
  Mail, 
  Clock,
  CheckCircle2,
  Star,
  ArrowRight,
  Play,
  Users,
  Shield,
  Zap
} from "lucide-react"
import Link from "next/link"

export function LandingPageOptimized() {
  return (
    <div className="min-h-screen bg-background">
      {/* Section 1: Banner + Hero */}
      <section className="relative overflow-hidden bg-background py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Beta Banner */}
            <div className="mb-12 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Badge className="bg-primary text-primary-foreground px-4 py-1">
                  🚀 FREE BETA
                </Badge>
                <Badge variant="outline" className="border-primary text-primary">
                  Limited Time
                </Badge>
              </div>
              <p className="text-base font-medium text-foreground text-center">
                VetScribe is <strong>completely free</strong> during beta. Pricing starts at $79/month later.
              </p>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                <strong>Early adopters lock in 50% off for life!</strong> Sign up now to secure founder pricing.
              </p>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl text-balance">
              Save <span className="text-green-600">60+ Minutes Daily</span> on Veterinary Notes
            </h1>

            <p className="mt-6 text-xl leading-8 text-muted-foreground text-pretty max-w-3xl mx-auto">
              AI-powered transcription and SOAP note generation for veterinary practices. 
              Record appointments, get professional documentation instantly.
            </p>

            {/* Primary CTA */}
            <div className="mt-10 flex items-center justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-4 text-lg" asChild>
                <a href="/sign-in">
                  🚀 Start Free Beta Access
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                ✅ No credit card required • ✅ Google sign-in • ✅ Cancel anytime
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Join <strong>500+ veterinarians</strong> saving time with VetScribe
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

      {/* Section 2: Honest Social Proof */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Built for Veterinary Professionals</h2>
            <p className="text-muted-foreground">Designed with real veterinary workflow in mind</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Time Savings</h3>
                <p className="text-sm text-muted-foreground">
                  Reduce documentation time from 10 minutes to 30 seconds per appointment. 
                  Focus on patient care, not paperwork.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">HIPAA Compliant</h3>
                <p className="text-sm text-muted-foreground">
                  Enterprise-grade security designed for veterinary practices. 
                  Your patient data is always protected.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Practice Ready</h3>
                <p className="text-sm text-muted-foreground">
                  Works with all major PIMS systems. Mobile-optimized for busy 
                  veterinarians on the go.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA 2 */}
          <div className="text-center mt-12">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3" asChild>
              <a href="/sign-in">
                Start Your Free Beta Today
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Section 3: How It Works */}
      <section id="demo" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How VetScribe Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From appointment recording to client communication in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="bg-red-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Mic className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">1. Record</h3>
              <p className="text-sm text-muted-foreground">
                Simply press record during your appointment. Unlimited duration, crystal clear audio.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">2. AI Processing</h3>
              <p className="text-sm text-muted-foreground">
                Our AI transcribes and generates professional SOAP notes with dental charts automatically.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">3. Review & Edit</h3>
              <p className="text-sm text-muted-foreground">
                Review your professional notes, customize with templates, and transfer to your PIMS.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Mail className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">4. Communicate</h3>
              <p className="text-sm text-muted-foreground">
                Send professional client summaries automatically. Keep pet owners informed and engaged.
              </p>
            </div>
          </div>

          {/* CTA 3 */}
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" className="px-8 py-3 border-primary text-primary hover:bg-primary hover:text-primary-foreground" asChild>
              <a href="/sign-in">
                Try the Complete Workflow - Free Beta
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Section 4: Benefits Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Veterinarians Choose VetScribe</h2>
            <p className="text-muted-foreground">Proven benefits for busy veterinary practices</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="bg-green-100 rounded-lg p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Save 60+ Minutes Daily</h3>
              <p className="text-muted-foreground">
                Reduce documentation time from 10 minutes to 30 seconds per appointment. 
                Focus more on patient care, less on paperwork.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-lg p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Professional Quality</h3>
              <p className="text-muted-foreground">
                AI-generated SOAP notes with veterinary templates. Professional dental charts 
                and client communications every time.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-lg p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Better Client Care</h3>
              <p className="text-muted-foreground">
                Automated client summaries and follow-up emails. Keep pet owners informed 
                and improve practice communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground">Complete veterinary workflow in one platform</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-red-100 rounded-lg p-3 w-12 h-12 mb-4 flex items-center justify-center">
                  <Mic className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Unlimited Recording</h3>
                <p className="text-sm text-muted-foreground">
                  Record appointments of any length. Crystal clear audio capture with browser-based technology.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-blue-100 rounded-lg p-3 w-12 h-12 mb-4 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI SOAP Notes</h3>
                <p className="text-sm text-muted-foreground">
                  Professional veterinary templates with AI-powered generation. Dental, wellness, emergency protocols included.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-purple-100 rounded-lg p-3 w-12 h-12 mb-4 flex items-center justify-center">
                  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Dental Charts</h3>
                <p className="text-sm text-muted-foreground">
                  AI-generated dental charts from COHAT procedures. Visual tooth-by-tooth analysis and findings.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-green-100 rounded-lg p-3 w-12 h-12 mb-4 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Client Communication</h3>
                <p className="text-sm text-muted-foreground">
                  Generate and send professional client summaries. Automated follow-up emails and visit reports.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-orange-100 rounded-lg p-3 w-12 h-12 mb-4 flex items-center justify-center">
                  <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">PIMS Integration</h3>
                <p className="text-sm text-muted-foreground">
                  1-click transfer to ezyVet, AVImark, ImproMed, and more. Customizable formats for any system.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-indigo-100 rounded-lg p-3 w-12 h-12 mb-4 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">HIPAA Compliant</h3>
                <p className="text-sm text-muted-foreground">
                  Enterprise-grade security with end-to-end encryption. Your patient data is always protected.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA 4 */}
          <div className="text-center mt-12">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3" asChild>
              <a href="/sign-in">
                Get All Features Free During Beta
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Section 6: Clear Pricing Strategy */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground">Free during beta, then affordable monthly pricing</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="relative border-2 border-primary bg-background">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-6 py-2 text-sm font-semibold">
                  🚀 FREE BETA ACCESS
                </Badge>
              </div>
              <CardContent className="pt-12 pb-8">
                <div className="text-center">
                  <h3 className="text-3xl font-bold mb-4">Currently Free</h3>
                  <div className="text-6xl font-bold text-primary mb-2">$0</div>
                  <p className="text-lg text-muted-foreground mb-8">
                    Complete access to all VetScribe features during beta
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                    <h4 className="font-semibold text-blue-900 mb-4">What happens after beta?</h4>
                    <div className="grid md:grid-cols-2 gap-6 text-left">
                      <div>
                        <div className="text-2xl font-bold text-gray-600 mb-2">$79/month</div>
                        <p className="text-sm text-gray-600">Standard pricing for new users</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary mb-2">$39/month</div>
                        <p className="text-sm text-primary font-medium">Your price as beta user (50% off forever)</p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-800 font-medium">
                        💡 Lock in 50% off for life by joining the beta now
                      </p>
                    </div>
                  </div>

                  <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 text-lg" asChild>
                    <a href="/sign-in">
                      🚀 Secure Your Founder Pricing
                    </a>
                  </Button>
                  
                  <p className="text-xs text-muted-foreground mt-4">
                    ✅ No credit card required • ✅ Cancel anytime • ✅ Founder pricing guaranteed
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 7: Final CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Save 60+ Minutes Daily?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join the free beta and lock in 50% off for life when pricing launches
          </p>
          
          <div className="flex items-center justify-center mb-8">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 px-12 py-4 text-lg font-semibold" asChild>
              <a href="/sign-in">
                🚀 Start Free Beta - 2 Minute Setup
              </a>
            </Button>
          </div>

          <div className="text-center text-sm opacity-80">
            <p>✅ No credit card required • ✅ Google sign-in • ✅ Founder pricing guaranteed</p>
          </div>
        </div>
      </section>
    </div>
  )
}
