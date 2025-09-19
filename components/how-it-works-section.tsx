import { Card, CardContent } from "@/components/ui/card"
import { Mic, Zap, FileText, Mail } from "lucide-react"

const steps = [
  {
    step: 1,
    title: "Record your appointment",
    description:
      "Simply press record during your appointment. Our app captures conversations and key details automatically.",
    icon: Mic,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    step: 2,
    title: 'Hit "Scribble" when ready',
    description:
      "When you've finished recording, we'll take care of the rest. Our notes will be ready for your review in seconds.",
    icon: Zap,
    color: "bg-purple-100 text-purple-600",
  },
  {
    step: 3,
    title: "Your notes are done",
    description:
      "Review and edit your professionally formatted notes. Add any additional details or customize the template.",
    icon: FileText,
    color: "bg-green-100 text-green-600",
  },
  {
    step: 4,
    title: "Send your client an email",
    description:
      "Automatically send a client-friendly summary based on the appointment. Customize templates for different visit types.",
    icon: Mail,
    color: "bg-red-100 text-red-600",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl text-balance">How it works</h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <Card key={step.step} className="relative border-0 shadow-sm bg-card">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${step.color} mb-4`}>
                    <step.icon className="h-6 w-6" />
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      {step.step}. {step.title}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>

                  {/* Step illustration */}
                  <div className="mt-4 w-full max-w-32">
                    <img
                      src={
                        step.step === 1 ? "/record-icon.png" :
                        step.step === 2 ? "/processing-icon.png" :
                        step.step === 3 ? "/notes-icon.png" :
                        step.step === 4 ? "/email-icon.png" :
                        `/step-${step.step}-icon.png`
                      }
                      alt={`Step ${step.step}: ${step.title}`}
                      className="w-full h-20 rounded-lg shadow-sm object-contain"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
