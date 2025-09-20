"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
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
  Zap,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import Link from "next/link"

function FAQItem({ question, answer, isOpen, onToggle }: { 
  question: string; 
  answer: string; 
  isOpen: boolean; 
  onToggle: () => void; 
}) {
  return (
    <div className="border border-border rounded-lg">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <h3 className="text-lg font-semibold">{question}</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-muted-foreground">{answer}</p>
        </div>
      )}
    </div>
  )
}

export function LandingPageOptimized() {
  // Interactive FAQ accordion component
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const faqData = [
    {
      question: "Do I need a credit card to try SwiftVet?",
      answer: "No. SwiftVet is completely free during beta, and you can start using it right away without a credit card."
    },
    {
      question: "How long will beta access last?",
      answer: "Free beta access runs until early 2026. After that, SwiftVet will start at $79/month — but early adopters keep 50% off for life."
    },
    {
      question: "Is my data secure?",
      answer: "Yes. SwiftVet is HIPAA compliant, SOC 2 certified, and all notes are encrypted in transit and at rest."
    },
    {
      question: "Can my whole team use SwiftVet?",
      answer: "Yes. You can invite your support staff and associates at no extra cost during beta. Team access will remain affordable under founder pricing."
    },
    {
      question: "What devices does SwiftVet work on?",
      answer: "SwiftVet works in any modern browser on desktop, tablet, or mobile."
    }
  ]
  return (
    <div className="min-h-screen bg-background">
      {/* Section 1: Banner + Hero */}
      <section className="relative overflow-hidden bg-background py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            {/* Beta Banner - Cleaner Design */}
            <div className="mb-12 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium mb-3">
                  Free Beta Access — Through Q4 2025
                </div>
                <p className="text-base font-medium text-foreground mb-2">
                  SwiftVet is <strong>completely free</strong> during beta. Pricing starts at $79/month later.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Early adopters lock in 50% off for life!</strong> Sign up now to secure founder pricing.
                </p>
                
                {/* Banner CTA */}
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2" asChild>
                  <a href="/sign-in">
                    Secure Founder Pricing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl text-balance mb-8">
              Save <span className="text-primary">60+ Minutes Daily</span> on Veterinary Notes
            </h1>

            <p className="text-xl leading-8 text-muted-foreground text-pretty max-w-4xl mx-auto mb-12">
              AI-powered transcription and SOAP note generation for veterinary practices. 
              Record appointments, get professional documentation instantly.
            </p>
            
            <div className="text-center mb-8">
              <p className="text-sm text-muted-foreground">
                ✅ No credit card required • ✅ Google sign-in • ✅ Cancel anytime
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Join <strong>500+ veterinarians</strong> saving time with SwiftVet
              </p>
            </div>

            {/* Trust badges */}
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 opacity-70">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">SOC 2 Certified</span>
              </div>
            </div>
          </div>

          {/* Hero illustration */}
          <div className="mt-20 flex justify-center">
            <div className="relative">
              <img
                src="/vetscribe-hero.png"
                alt="SwiftVet - Veterinarian using AI-powered veterinary notes system with patient"
                className="h-96 w-auto rounded-2xl shadow-2xl border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Honest Social Proof */}
      <section id="social-proof" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Built for Veterinary Professionals</h2>
            <p className="text-lg text-muted-foreground">Designed with real veterinary workflow in mind</p>
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

          {/* Add testimonials here instead of CTA */}
          <div className="mt-20">
            <h3 className="text-2xl font-bold text-center mb-12">What Veterinarians Are Saying</h3>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    "SwiftVet has transformed my practice. I save over an hour daily on documentation."
                  </p>
                  <div className="text-center">
                    <p className="text-sm font-semibold">Dr. Sarah Chen, DVM</p>
                    <p className="text-xs text-muted-foreground">Mountain View Animal Hospital</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    "The AI-generated SOAP notes are incredibly accurate. My clients love the detailed summaries."
                  </p>
                  <div className="text-center">
                    <p className="text-sm font-semibold">Dr. Michael Rodriguez</p>
                    <p className="text-xs text-muted-foreground">Central Valley Veterinary Clinic</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    "Perfect for busy practices. The documentation quality is consistently professional."
                  </p>
                  <div className="text-center">
                    <p className="text-sm font-semibold">Dr. Lisa Thompson, DVM</p>
                    <p className="text-xs text-muted-foreground">Riverside Emergency Vet</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How SwiftVet Works</h2>
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

          {/* Strategic CTA after How It Works */}
          <div className="text-center mt-20">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-4 text-lg" asChild>
              <a href="/sign-in">
                Start Free Beta Access
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Section 4: Benefits Grid */}
      <section id="benefits" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Veterinarians Choose SwiftVet</h2>
            <p className="text-lg text-muted-foreground">Proven benefits for busy veterinary practices</p>
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
      <section id="features" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-lg text-muted-foreground">Complete veterinary workflow in one platform</p>
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

        </div>
      </section>

      {/* Section 6: Clear Pricing Strategy */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground">Free during beta, then affordable monthly pricing</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="relative border-2 border-primary bg-background">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-6 py-2 text-sm font-semibold">
                  FREE BETA ACCESS
                </Badge>
              </div>
              <CardContent className="pt-12 pb-8">
                <div className="text-center">
                  <h3 className="text-3xl font-bold mb-4">Currently Free</h3>
                  <div className="text-6xl font-bold text-primary mb-2">$0</div>
                  <p className="text-lg text-muted-foreground mb-8">
                    Complete access to all SwiftVet features during beta
                  </p>
                  
                  {/* Feature List */}
                  <div className="text-left max-w-md mx-auto mb-8">
                    <h4 className="font-semibold mb-4 text-center">Everything included:</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-sm">Unlimited appointment recordings</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-sm">AI-powered SOAP note generation</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-sm">Automated dental charts</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-sm">Client communication tools</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-sm">PIMS integration & export</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-sm">Email setup & configuration</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-orange-500 flex-shrink-0" />
                        <span className="text-sm font-medium">50% off forever when pricing launches</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-8">
                    <div className="text-center">
                      <h4 className="font-semibold text-blue-900 mb-8">What happens after beta?</h4>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-12 mb-8">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-gray-600 mb-3">$79</div>
                          <p className="text-sm text-gray-600 font-medium">per month</p>
                          <p className="text-xs text-gray-500 mt-1">Standard pricing for new users</p>
                        </div>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-primary mb-3">$39</div>
                          <p className="text-sm text-primary font-medium">per month</p>
                          <p className="text-xs text-primary mt-1">Your price as beta user (50% off forever)</p>
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">
                          💡 Lock in 50% off for life by joining the beta now
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 text-lg" asChild>
                    <a href="/sign-in">
                      Secure Your Founder Pricing
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

      {/* Section 7: FAQ */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">Everything you need to know about SwiftVet</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqData.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === index}
                onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section 8: Final CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Save 60+ Minutes Daily?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join the free beta and lock in 50% off for life when pricing launches
          </p>
          
          <div className="flex items-center justify-center mb-8">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 px-12 py-4 text-lg font-semibold" asChild>
              <a href="/sign-in">
                Start Free Beta - 2 Minute Setup
              </a>
            </Button>
          </div>

          <div className="text-center text-sm opacity-80">
            <p>✅ No credit card required • ✅ Google sign-in • ✅ Founder pricing guaranteed</p>
            <p className="mt-2">
              Questions? Email us at <a href="mailto:hello@swiftvet.app" className="text-white underline hover:no-underline">hello@swiftvet.app</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
