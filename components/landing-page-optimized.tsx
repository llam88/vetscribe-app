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
            <div className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
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

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl text-balance">
              Save <span className="text-green-600">60+ Minutes Daily</span> on Veterinary Notes
            </h1>

            <p className="mt-6 text-xl leading-8 text-muted-foreground text-pretty max-w-3xl mx-auto">
              AI-powered transcription and SOAP note generation for veterinary practices. 
              Record appointments, get professional documentation instantly.
            </p>

            {/* Primary CTA */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg" asChild>
                <a href="/sign-in">
                  🚀 Start Free Beta Access
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg" asChild>
                <a href="#demo">
                  <Play className="mr-2 h-5 w-5" />
                  Watch 2-Min Demo
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
          </div>
        </div>
      </section>

      {/* Section 2: Social Proof */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted by Veterinary Professionals</h2>
            <p className="text-muted-foreground">Join hundreds of vets already saving time with VetScribe</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  "VetScribe saves me 90 minutes every day. The dental chart feature is incredible - no more hand-drawing charts!"
                </p>
                <div className="text-sm font-medium">Dr. Sarah Johnson</div>
                <div className="text-xs text-muted-foreground">Happy Paws Veterinary Clinic</div>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  "The AI transcription is amazingly accurate. SOAP notes that used to take 10 minutes now take 30 seconds."
                </p>
                <div className="text-sm font-medium">Dr. Michael Chen</div>
                <div className="text-xs text-muted-foreground">City Animal Hospital</div>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  "Game changer for our practice. Client emails are professional and the PIMS integration saves so much time."
                </p>
                <div className="text-sm font-medium">Dr. Lisa Rodriguez</div>
                <div className="text-xs text-muted-foreground">Westside Veterinary Group</div>
              </CardContent>
            </Card>
          </div>

          {/* CTA 2 */}
          <div className="text-center mt-12">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3" asChild>
              <a href="/sign-in">
                Join These Veterinarians - Start Free Beta
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
            <Button size="lg" variant="outline" className="px-8 py-3" asChild>
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
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3" asChild>
              <a href="/sign-in">
                Get All Features Free During Beta
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Section 6: Early Access Pricing */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Founder Pricing - Limited Time</h2>
            <p className="text-muted-foreground">Lock in special pricing before we launch publicly</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Beta Access */}
              <Card className="relative border-2 border-green-200 bg-green-50">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-600 text-white px-4 py-1">
                    CURRENT OFFER
                  </Badge>
                </div>
                <CardContent className="pt-8 pb-8">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Free Beta Access</h3>
                    <div className="text-4xl font-bold text-green-600 mb-4">$0/month</div>
                    <p className="text-sm text-muted-foreground mb-6">
                      Complete access to all features during beta period
                    </p>
                    
                    <ul className="text-left space-y-3 mb-8">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Unlimited appointments & recordings</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">AI SOAP notes & dental charts</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Client communication tools</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">PIMS integration</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm"><strong>50% off for life</strong> when pricing launches</span>
                      </li>
                    </ul>

                    <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white" asChild>
                      <a href="/sign-in">
                        🚀 Start Free Beta Now
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Future Pricing */}
              <Card className="border-2 border-gray-200">
                <CardContent className="pt-8 pb-8">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Future Pricing</h3>
                    <div className="text-4xl font-bold text-gray-600 mb-4">$79/month</div>
                    <p className="text-sm text-muted-foreground mb-6">
                      Standard pricing after beta period ends
                    </p>
                    
                    <ul className="text-left space-y-3 mb-8">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">All current features</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">Priority support</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">Advanced analytics</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">Team collaboration</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-orange-500" />
                        <span className="text-sm"><strong>Early adopters pay $39.50/month</strong></span>
                      </li>
                    </ul>

                    <Button size="lg" variant="outline" className="w-full" disabled>
                      Available After Beta
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Smart Strategy:</strong> Sign up for free beta now, get 50% off forever when pricing launches
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Final CTA */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Practice?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join hundreds of veterinarians already saving 60+ minutes daily with VetScribe AI
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold" asChild>
              <a href="/sign-in">
                🚀 Start Free Beta - 2 Minute Setup
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600 px-8 py-4" asChild>
              <a href="mailto:hello@vetscribe.com">
                📧 Questions? Contact Us
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
