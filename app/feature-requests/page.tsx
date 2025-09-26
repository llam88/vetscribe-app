"use client"

import { useState } from 'react'
import { MainNavigation } from "@/components/main-navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Lightbulb } from "lucide-react"

export default function FeatureRequestsPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      practice: formData.get('practice'),
      priority: formData.get('priority'),
      feature: formData.get('feature'),
      useCase: formData.get('useCase'),
      type: 'feature-request'
    }

    try {
      const response = await fetch('/api/feature-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setMessage('✅ Thank you! We\'ll review your feature request and get back to you.')
        const form = e.currentTarget
        if (form) {
          form.reset()
        }
      } else {
        setMessage('❌ Failed to submit request. Please try again.')
      }
    } catch (error) {
      setMessage('❌ Failed to submit request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <Lightbulb className="h-8 w-8 text-primary" />
            Feature Requests
          </h1>
          <p className="text-muted-foreground text-lg">
            Help shape SwiftVet! Tell us what features would make your practice more efficient.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Feature Request Form */}
          <Card>
            <CardHeader>
              <CardTitle>Request a Feature</CardTitle>
              <p className="text-sm text-muted-foreground">
                What would make SwiftVet more valuable for your veterinary practice?
              </p>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Dr. John Smith"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="doctor@yourpractice.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="practice" className="block text-sm font-medium mb-2">
                    Practice Name
                  </label>
                  <input
                    type="text"
                    id="practice"
                    name="practice"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Your Veterinary Practice"
                  />
                </div>
                
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium mb-2">
                    Priority *
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">How important is this feature?</option>
                    <option value="low">Nice to have</option>
                    <option value="medium">Would be helpful</option>
                    <option value="high">Critical for our practice</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="feature" className="block text-sm font-medium mb-2">
                    Feature Request *
                  </label>
                  <textarea
                    id="feature"
                    name="feature"
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Describe the feature you'd like to see..."
                  />
                </div>
                
                <div>
                  <label htmlFor="useCase" className="block text-sm font-medium mb-2">
                    How would you use this?
                  </label>
                  <textarea
                    id="useCase"
                    name="useCase"
                    rows={3}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Tell us about your workflow and how this feature would help..."
                  />
                </div>
                
                <div className="text-center">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Feature Request'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  {message && (
                    <p className="mt-4 text-sm font-medium">{message}</p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Why We Value Your Input */}
          <Card>
            <CardHeader>
              <CardTitle>Why Your Input Matters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Built by Vets, for Vets</h3>
                <p className="text-sm text-muted-foreground">
                  SwiftVet is designed specifically for veterinary workflows. Your real-world 
                  experience helps us build features that actually matter.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Direct Founder Access</h3>
                <p className="text-sm text-muted-foreground">
                  As a beta user, you have direct access to our development team. 
                  We prioritize features based on practicing veterinarian feedback.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Feature Implementation</h3>
                <p className="text-sm text-muted-foreground">
                  High-priority requests from beta users are typically implemented 
                  within 2-4 weeks. We'll notify you when your requested feature is live.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Recent Implementations</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Dental chart automation (requested by Dr. Martinez)</li>
                  <li>• Bulk client email sending (requested by Dr. Thompson)</li>
                  <li>• PIMS export formatting (requested by Central Valley Vet)</li>
                </ul>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Questions about a feature request?<br/>
                  Email us directly at{" "}
                  <a href="mailto:hello@swiftvet.app" className="text-primary hover:text-primary/80 font-medium">
                    hello@swiftvet.app
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
