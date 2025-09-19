"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Mic, FileText, Users, Mail, Play, ArrowRight, Sparkles, Plus } from "lucide-react"
import Link from "next/link"

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  href: string
  completed: boolean
  isActive: boolean
}

interface TrialOnboardingProps {
  userEmail?: string
  completedSteps?: string[]
  appointments?: any[]
}

export function TrialOnboarding({ userEmail, completedSteps = [], appointments = [] }: TrialOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showWelcome, setShowWelcome] = useState(true)

  // Calculate real completion based on actual data
  const hasAppointments = appointments && appointments.length > 0
  const hasRecordings = appointments && appointments.some((a: any) => a.transcription)
  const hasSOAPNotes = appointments && appointments.some((a: any) => a.soap_note)
  const hasEmailDrafts = typeof window !== 'undefined' && localStorage.getItem('vetscribe-email-drafts')
  const hasEmailConfig = typeof window !== 'undefined' && localStorage.getItem('vetscribe-user-email-config')

  const steps: OnboardingStep[] = [
    {
      id: "appointment",
      title: "Create Your First Appointment",
      description: "Schedule a patient visit to get started",
      icon: Plus,
      href: "/appointments",
      completed: hasAppointments,
      isActive: currentStep === 0
    },
    {
      id: "record",
      title: "Record & Transcribe",
      description: "Try our AI-powered transcription system",
      icon: Mic,
      href: hasAppointments ? `/appointments/${appointments[0]?.id}/record` : "/appointments",
      completed: hasRecordings,
      isActive: currentStep === 1
    },
    {
      id: "soap",
      title: "Generate SOAP Notes",
      description: "Create professional veterinary documentation",
      icon: FileText,
      href: hasAppointments ? `/appointments/${appointments[0]?.id}/record` : "/appointments",
      completed: hasSOAPNotes,
      isActive: currentStep === 2
    },
    {
      id: "communication",
      title: "Send Client Emails",
      description: "Generate and send professional client communications",
      icon: Mail,
      href: "/communication",
      completed: !!hasEmailDrafts,
      isActive: currentStep === 3
    },
    {
      id: "settings",
      title: "Configure Email Settings",
      description: "Set up your email provider for direct sending",
      icon: Play,
      href: "/settings",
      completed: !!hasEmailConfig,
      isActive: currentStep === 4
    }
  ]

  const completedCount = steps.filter(step => step.completed).length
  const progressPercent = (completedCount / steps.length) * 100
  const nextIncompleteStep = steps.find(step => !step.completed)

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  if (!showWelcome) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <Sparkles className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-blue-900">Welcome to VetScribe! 🎉</h2>
                <p className="text-blue-700">
                  You're on a <strong>free trial</strong>. Use the buttons below to get started.
                </p>
                {userEmail && (
                  <p className="text-sm text-blue-600 mt-1">Signed in as {userEmail}</p>
                )}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowWelcome(false)}
              className="text-blue-700 hover:bg-blue-100"
            >
              ×
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Start Actions */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Quick Start</CardTitle>
          <p className="text-sm text-muted-foreground">
            Click any button below to start using VetScribe
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild className="h-20 flex-col gap-2">
              <a href="/appointments">
                <Plus className="h-6 w-6" />
                Create Appointment
              </a>
            </Button>
            
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <a href="/patients">
                <Users className="h-6 w-6" />
                Add Patient
              </a>
            </Button>
            
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <a href="/record">
                <Mic className="h-6 w-6" />
                Quick Record
              </a>
            </Button>
            
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <a href="/communication">
                <Mail className="h-6 w-6" />
                Send Emails
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              🚀 Your Trial Progress
              <Badge variant="secondary">{completedCount}/{steps.length} completed</Badge>
            </CardTitle>
            <Badge className="bg-green-100 text-green-800">
              Free Trial Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Setup Progress</span>
                <span>{Math.round(progressPercent)}% complete</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
            
            {nextIncompleteStep ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">Next Step:</h4>
                    <p className="text-sm text-blue-700">{nextIncompleteStep.title}</p>
                  </div>
                  <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <a href={nextIncompleteStep.href}>
                      Start Now
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <h4 className="font-medium text-green-900">🎉 All steps completed!</h4>
                <p className="text-sm text-green-700">You've experienced the full power of VetScribe AI!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Smart Workflow Steps */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">🎯 Your Next Steps</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          {/* Step 1: Create First Appointment */}
          <Card className={`${
            (appointments && appointments.length === 0) || !appointments ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                {(appointments && appointments.length === 0) || !appointments ? (
                  <div className="rounded-full bg-blue-500 p-2">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                ) : (
                  <div className="rounded-full bg-green-500 p-2">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold">
                    {(appointments && appointments.length === 0) || !appointments ? 'Create Your First Appointment' : `${appointments.length} Appointments Created`}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {(appointments && appointments.length === 0) || !appointments ? 'Schedule patient visits to get started' : 'Ready to record and document visits'}
                  </p>
                </div>
              </div>
              <Button asChild className="w-full" variant={(appointments && appointments.length === 0) || !appointments ? "default" : "outline"}>
                <a href="/appointments">
                  {(appointments && appointments.length === 0) || !appointments ? 'Create Appointment' : 'Manage Appointments'}
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className={`${
            appointments && appointments.some((a: any) => a.soap_note) ? 'bg-green-50 border-green-200' : 
            appointments && appointments.length > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                {appointments && appointments.some((a: any) => a.soap_note) ? (
                  <div className="rounded-full bg-green-500 p-2">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                ) : appointments && appointments.length > 0 ? (
                  <div className="rounded-full bg-yellow-500 p-2">
                    <Mic className="h-5 w-5 text-white" />
                  </div>
                ) : (
                  <div className="rounded-full bg-gray-300 p-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold">
                    {appointments && appointments.some((a: any) => a.soap_note) ? 'Documentation Complete' :
                     appointments && appointments.length > 0 ? 'Record & Document Visits' : 'Documentation Ready'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {appointments && appointments.some((a: any) => a.soap_note) ? 'SOAP notes generated and ready' :
                     appointments && appointments.length > 0 ? 'Start recording your scheduled appointments' : 'Create appointments first'}
                  </p>
                </div>
              </div>
              <Button 
                asChild 
                className="w-full" 
                variant={appointments && appointments.some((a: any) => a.soap_note) ? "outline" : appointments && appointments.length > 0 ? "default" : "secondary"}
                disabled={!appointments || appointments.length === 0}
              >
                <a href={appointments && appointments.length > 0 ? `/appointments/${appointments[0]?.id}/record` : "/appointments"}>
                  {appointments && appointments.some((a: any) => a.soap_note) ? 'Review Documentation' :
                   appointments && appointments.length > 0 ? 'Start Recording' : 'Create Appointment First'}
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Progress Actions */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-900 mb-1">Ready to continue? 🎯</h3>
              <p className="text-sm text-green-700">
                {appointments && appointments.length > 0 
                  ? 'You have appointments ready for recording and documentation'
                  : 'Start by creating your first appointment'}
              </p>
            </div>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <a href={appointments && appointments.length > 0 ? "/appointments" : "/appointments"}>
                {appointments && appointments.length > 0 ? 'Continue Workflow' : 'Get Started'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Completion Celebration */}
      {completedCount === steps.length && (
        <Card className="bg-gradient-to-r from-green-50 to-yellow-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="rounded-full bg-green-100 p-4 w-16 h-16 mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-2">
                🎉 Congratulations! Trial Complete
              </h3>
              <p className="text-green-700 mb-4">
                You've experienced all the core features of VetScribe AI. Ready to transform your practice?
              </p>
              <div className="flex gap-4 justify-center">
                <Button className="bg-green-600 hover:bg-green-700">
                  Upgrade to Pro
                </Button>
                <Button variant="outline">
                  Continue Trial
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
