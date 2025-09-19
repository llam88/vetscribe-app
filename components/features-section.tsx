import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Clock, Shield, Users, Zap, FileCheck } from "lucide-react"

const features = [
  {
    title: "Visual dental charts",
    description:
      "Turn your COHAT into representative canine and feline dental charts, mapping observations and scores to individual teeth.",
    icon: FileCheck,
    badge: "Popular",
  },
  {
    title: "High accuracy, detailed AI",
    description: "Built on AI models tuned for veterinary medicine that can be quickly and performant on the device.",
    icon: Brain,
    badge: null,
  },
  {
    title: "1-click transfer to PIMS",
    description:
      "Quickly transfer your SOAP notes to your PIMS with a single click! Available for ezyVet, Onyx, and more.",
    icon: Zap,
    badge: null,
  },
  {
    title: "Full team access",
    description: "Invite your whole team including technicians and front desk staff without additional cost.",
    icon: Users,
    badge: null,
  },
  {
    title: "HIPAA compliant",
    description: "Enterprise-grade security with end-to-end encryption and HIPAA compliance built in.",
    icon: Shield,
    badge: null,
  },
  {
    title: "Save 10+ minutes per appointment",
    description: "Reduce documentation time and focus more on patient care with automated note generation.",
    icon: Clock,
    badge: null,
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl text-balance mb-4">Feature Spotlight</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Everything you need to streamline your veterinary documentation workflow
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="border border-border hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  {feature.badge && (
                    <Badge variant="secondary" className="bg-accent/10 text-accent">
                      {feature.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature spotlight with image */}
        <div className="mt-20">
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <Badge variant="secondary" className="w-fit mb-4 bg-accent/10 text-accent">
                  Feature Spotlight
                </Badge>
                <h3 className="text-2xl font-bold text-foreground mb-4 text-balance">Visual dental charts</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Turn your COHAT into representative canine and feline dental charts, mapping observations and scores
                  to individual teeth.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    Easy-to-read dental chart visualization
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    Accurate mapping of dental observations
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    Eliminate manual chart drawing
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    Support for comprehensive dental scoring
                  </li>
                </ul>
              </div>
              <div className="bg-muted/30 p-8 lg:p-12 flex items-center justify-center">
                <img
                  src="/dental-chart-showcase.png"
                  alt="Interactive veterinary dental chart with AI-powered analysis showing Modified Triadan numbering and color-coded conditions"
                  className="w-full max-w-md h-auto rounded-lg shadow-sm"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
