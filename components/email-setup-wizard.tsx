"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Mail, 
  CheckCircle2, 
  ExternalLink, 
  Copy,
  Settings,
  Zap,
  DollarSign,
  Clock,
  Shield
} from "lucide-react"

interface EmailProvider {
  name: string
  cost: string
  setupTime: string
  difficulty: 'Easy' | 'Medium' | 'Advanced'
  features: string[]
  pros: string[]
  cons: string[]
}

const emailProviders: EmailProvider[] = [
  {
    name: "Resend",
    cost: "Free (3K emails/month)",
    setupTime: "5 minutes",
    difficulty: "Easy",
    features: ["Professional emails", "Delivery tracking", "Simple API", "Great for startups"],
    pros: ["Easiest setup", "Reliable delivery", "Great documentation", "Veterinary-friendly"],
    cons: ["Newer service", "Limited advanced features"]
  },
  {
    name: "SendGrid",
    cost: "Free (100 emails/day)",
    setupTime: "10 minutes", 
    difficulty: "Easy",
    features: ["Advanced analytics", "Template system", "A/B testing", "Enterprise features"],
    pros: ["Industry standard", "Advanced features", "Great analytics", "Scalable"],
    cons: ["More complex", "Can be expensive at scale"]
  },
  {
    name: "Gmail/Google Workspace",
    cost: "$6/month per user",
    setupTime: "15 minutes",
    difficulty: "Medium",
    features: ["Use your practice email", "Familiar interface", "Calendar integration", "Drive storage"],
    pros: ["Professional domain", "Familiar to users", "Full office suite", "Trusted brand"],
    cons: ["Monthly cost", "Requires domain setup", "SMTP configuration"]
  },
  {
    name: "Custom SMTP",
    cost: "$5-50/month",
    setupTime: "30-60 minutes",
    difficulty: "Advanced",
    features: ["Full control", "Custom domains", "Advanced routing", "White-label"],
    pros: ["Complete control", "Custom branding", "Advanced features", "No vendor lock-in"],
    cons: ["Complex setup", "Requires technical knowledge", "More maintenance"]
  }
]

export function EmailSetupWizard() {
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider>(emailProviders[0])
  const [currentStep, setCurrentStep] = useState(1)
  const [setupData, setSetupData] = useState({
    apiKey: '',
    fromEmail: '',
    domain: '',
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPassword: ''
  })
  const [testEmailSent, setTestEmailSent] = useState(false)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const testEmailSetup = async () => {
    try {
      const response = await fetch('/api/test-email-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider.name,
          config: setupData
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setTestEmailSent(true)
        alert('✅ Test email sent successfully! Check your inbox.')
      } else {
        alert(`❌ Test failed: ${result.error}`)
      }
    } catch (error) {
      alert('❌ Error testing email setup')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Email Setup Wizard</h1>
        <p className="text-muted-foreground">
          Set up email sending to communicate with your clients professionally
        </p>
      </div>

      {/* Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Step 1: Choose Your Email Provider
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {emailProviders.map((provider) => (
              <div 
                key={provider.name}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedProvider.name === provider.name 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedProvider(provider)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{provider.name}</h3>
                      <Badge className={getDifficultyColor(provider.difficulty)}>
                        {provider.difficulty}
                      </Badge>
                      {provider.name === 'Resend' && (
                        <Badge className="bg-blue-100 text-blue-800">Recommended</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span>{provider.cost}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>{provider.setupTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-purple-600" />
                        <span>{provider.difficulty} setup</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-green-700 mb-1">✅ Pros:</h4>
                        <ul className="text-muted-foreground space-y-1">
                          {provider.pros.map((pro, i) => (
                            <li key={i}>• {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-red-700 mb-1">⚠️ Cons:</h4>
                        <ul className="text-muted-foreground space-y-1">
                          {provider.cons.map((con, i) => (
                            <li key={i}>• {con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Step 2: Configure {selectedProvider.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="instructions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="instructions">Setup Instructions</TabsTrigger>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
            </TabsList>
            
            <TabsContent value="instructions" className="space-y-4">
              {selectedProvider.name === 'Resend' && (
                <div className="space-y-4">
                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Recommended for VetScribe!</strong> Resend is the easiest and most reliable option for veterinary practices.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">Quick Setup Steps:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>
                        <strong>Sign up:</strong> Go to{' '}
                        <Button variant="link" className="p-0 h-auto" asChild>
                          <a href="https://resend.com" target="_blank">
                            resend.com <ExternalLink className="h-3 w-3 inline ml-1" />
                          </a>
                        </Button>
                      </li>
                      <li><strong>Verify your email</strong> and complete account setup</li>
                      <li><strong>Go to API Keys</strong> → Create new API key → Copy it</li>
                      <li><strong>Paste your API key below</strong> and test the connection</li>
                      <li><strong>Add to Vercel:</strong> We'll show you exactly how</li>
                    </ol>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Use a professional from email like: <code>noreply@yourpractice.com</code></li>
                      <li>• 3,000 free emails = ~100 appointments/month with follow-ups</li>
                      <li>• Delivery is instant and reliable</li>
                      <li>• Perfect for veterinary practices</li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedProvider.name === 'SendGrid' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">SendGrid Setup:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Go to <a href="https://sendgrid.com" target="_blank" className="text-blue-600">sendgrid.com</a> → Sign up</li>
                      <li>Complete account verification (may require ID)</li>
                      <li>Go to Settings → API Keys → Create API Key</li>
                      <li>Choose "Restricted Access" → Mail Send permissions</li>
                      <li>Copy the API key and paste below</li>
                    </ol>
                  </div>
                </div>
              )}

              {selectedProvider.name === 'Gmail/Google Workspace' && (
                <div className="space-y-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Domain Required:</strong> You'll need a custom domain (yourpractice.com) for professional emails.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">Google Workspace Setup:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Buy a domain (GoDaddy, Namecheap, etc.)</li>
                      <li>Sign up for Google Workspace ($6/month)</li>
                      <li>Set up your practice email: drsmith@yourpractice.com</li>
                      <li>Enable 2-factor authentication</li>
                      <li>Generate an "App Password" for VetScribe</li>
                      <li>Configure SMTP settings below</li>
                    </ol>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="configuration" className="space-y-4">
              {selectedProvider.name === 'Resend' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="resend-api-key">Resend API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="resend-api-key"
                        type="password"
                        placeholder="re_..."
                        value={setupData.apiKey}
                        onChange={(e) => setSetupData(prev => ({...prev, apiKey: e.target.value}))}
                      />
                      <Button variant="outline" onClick={() => copyToClipboard(setupData.apiKey)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="from-email">From Email Address</Label>
                    <Input
                      id="from-email"
                      type="email"
                      placeholder="noreply@yourpractice.com"
                      value={setupData.fromEmail}
                      onChange={(e) => setSetupData(prev => ({...prev, fromEmail: e.target.value}))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use onboarding@resend.dev if you don't have a custom domain yet
                    </p>
                  </div>

                  <Button onClick={testEmailSetup} disabled={!setupData.apiKey}>
                    <Mail className="h-4 w-4 mr-2" />
                    Test Email Setup
                  </Button>

                  {testEmailSent && (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        ✅ Email test successful! Your setup is working.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {selectedProvider.name === 'Gmail/Google Workspace' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gmail-user">Gmail Address</Label>
                      <Input
                        id="gmail-user"
                        type="email"
                        placeholder="drsmith@yourpractice.com"
                        value={setupData.fromEmail}
                        onChange={(e) => setSetupData(prev => ({...prev, fromEmail: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="app-password">App Password</Label>
                      <Input
                        id="app-password"
                        type="password"
                        placeholder="16-character app password"
                        value={setupData.smtpPassword}
                        onChange={(e) => setSetupData(prev => ({...prev, smtpPassword: e.target.value}))}
                      />
                    </div>
                  </div>
                  
                  <Alert>
                    <Settings className="h-4 w-4" />
                    <AlertDescription>
                      <strong>How to get App Password:</strong> Gmail → Manage Account → Security → 2-Step Verification → App Passwords → Generate
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Vercel Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Step 3: Add to Vercel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Environment Variables to Add:</h4>
            
            {selectedProvider.name === 'Resend' && (
              <div className="space-y-3">
                <div className="bg-white rounded border p-3 font-mono text-sm">
                  <div className="flex items-center justify-between">
                    <span>RESEND_API_KEY</span>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(setupData.apiKey)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-muted-foreground">{setupData.apiKey || 're_your_api_key_here'}</div>
                </div>
                
                <div className="bg-white rounded border p-3 font-mono text-sm">
                  <div className="flex items-center justify-between">
                    <span>FROM_EMAIL</span>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(setupData.fromEmail)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-muted-foreground">{setupData.fromEmail || 'noreply@yourpractice.com'}</div>
                </div>
              </div>
            )}

            <div className="space-y-3 mt-4">
              <h4 className="font-medium">How to add to Vercel:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to your <a href="https://vercel.com" target="_blank" className="text-blue-600">Vercel dashboard</a></li>
                <li>Click on your VetScribe project</li>
                <li>Go to <strong>Settings</strong> → <strong>Environment Variables</strong></li>
                <li>Click <strong>"Add New"</strong> for each variable above</li>
                <li>Go to <strong>Deployments</strong> → <strong>"Redeploy"</strong> latest deployment</li>
                <li>✅ Email sending will be active in 2-3 minutes!</li>
              </ol>
            </div>
          </div>

          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <strong>Need help?</strong> Follow the step-by-step video guide or contact support for assistance with email setup.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
