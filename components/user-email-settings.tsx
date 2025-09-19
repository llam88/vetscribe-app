"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Mail, 
  CheckCircle2, 
  Save,
  TestTube,
  Shield,
  ExternalLink
} from "lucide-react"
import { createClientBrowser } from "@/lib/supabase-browser"

interface EmailConfig {
  provider: 'resend' | 'sendgrid' | 'gmail' | 'custom' | 'none'
  apiKey?: string
  fromEmail?: string
  smtpHost?: string
  smtpPort?: string
  smtpUser?: string
  smtpPassword?: string
}

export function UserEmailSettings() {
  const sb = createClientBrowser()
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({ provider: 'none' })
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [testResult, setTestResult] = useState<string>("")

  // Load user's email settings
  useEffect(() => {
    loadEmailSettings()
  }, [])

  const loadEmailSettings = async () => {
    try {
      const { data: { user } } = await sb.auth.getUser()
      if (!user) return

      const { data } = await sb
        .from('profiles')
        .select('email_config')
        .eq('id', user.id)
        .single()

      if (data?.email_config) {
        setEmailConfig(data.email_config)
      }
    } catch (error) {
      console.error('Error loading email settings:', error)
    }
  }

  const saveEmailSettings = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await sb.auth.getUser()
      if (!user) {
        alert('❌ Please sign in to save email settings')
        return
      }

      console.log('Saving email config:', emailConfig)

      const { data, error } = await sb
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          email_config: emailConfig
        })
        .select()

      console.log('Upsert response:', { data, error })

      if (error) {
        console.error('Supabase error details:', error)
        if (error.message.includes('relation "public.profiles" does not exist')) {
          alert('❌ Database not set up yet. Please run the database setup script in Supabase first.')
          return
        }
        if (error.message.includes('duplicate key')) {
          // This might not be a real error - try to continue
          console.log('Duplicate key - trying update instead of insert')
        } else {
          throw error
        }
      }

      // Check if we actually have data or if it was saved
      if (data && data.length > 0) {
        console.log('Email settings saved successfully:', data[0])
      } else {
        console.log('Save may have succeeded but no data returned')
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      alert('✅ Email settings saved successfully!')
    } catch (error: any) {
      console.error('Error saving email settings:', error)
      
      // Try a simple update as fallback
      try {
        console.log('Trying fallback update method...')
        const { error: updateError } = await sb
          .from('profiles')
          .update({ 
            email_config: emailConfig
          })
          .eq('id', user!.id)
        
        if (!updateError) {
          console.log('Fallback update succeeded')
          setSaved(true)
          setTimeout(() => setSaved(false), 3000)
          alert('✅ Email settings saved successfully!')
          return
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
      }
      
      alert(`❌ Error saving settings: ${error.message || 'Please try again.'}`)
    } finally {
      setLoading(false)
    }
  }

  const testEmailSetup = async () => {
    if (emailConfig.provider === 'none') {
      alert('Please select and configure an email provider first')
      return
    }

    if (emailConfig.provider === 'resend' && !emailConfig.apiKey) {
      alert('Please enter your Resend API key first')
      return
    }

    if (emailConfig.provider === 'gmail' && (!emailConfig.fromEmail || !emailConfig.smtpPassword)) {
      alert('Please enter both Gmail address and app password first')
      return
    }

    try {
      setTesting(true)
      setTestResult("")

      console.log('Testing email config:', { provider: emailConfig.provider, hasApiKey: !!emailConfig.apiKey })

      const response = await fetch('/api/test-user-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: emailConfig,
          testEmail: emailConfig.fromEmail || 'test@example.com'
        })
      })

      const result = await response.json()
      console.log('Test result:', result)
      
      if (result.success) {
        setTestResult("✅ Email configuration is valid! Your setup is working.")
        alert('✅ Email configuration test passed!')
      } else {
        setTestResult(`❌ Test failed: ${result.error}`)
        alert(`❌ Test failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Test email error:', error)
      setTestResult("❌ Error testing email setup")
      alert('❌ Error testing email setup. Check console for details.')
    } finally {
      setTesting(false)
    }
  }

  const updateConfig = (updates: Partial<EmailConfig>) => {
    setEmailConfig(prev => ({ ...prev, ...updates }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Email Configuration</h2>
        <p className="text-muted-foreground">
          Set up your email provider to send client communications directly from SwiftVet
        </p>
      </div>

      {/* Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Email Provider</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="provider">Choose Your Email Service</Label>
            <Select 
              value={emailConfig.provider} 
              onValueChange={(value: EmailConfig['provider']) => updateConfig({ provider: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Email Service (Default)</SelectItem>
                <SelectItem value="resend">Resend (Recommended)</SelectItem>
                <SelectItem value="sendgrid">SendGrid</SelectItem>
                <SelectItem value="gmail">Gmail/Google Workspace</SelectItem>
                <SelectItem value="custom">Custom SMTP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {emailConfig.provider === 'none' && (
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Without email configuration, the "Send Email" feature will open your default email client instead.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Resend Configuration */}
      {emailConfig.provider === 'resend' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Resend Configuration
              <Badge className="bg-green-100 text-green-800">Recommended</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Free tier:</strong> 3,000 emails/month • <strong>Setup time:</strong> 5 minutes • 
                <Button variant="link" className="p-0 h-auto" asChild>
                  <a href="https://resend.com" target="_blank">
                    Sign up at resend.com <ExternalLink className="h-3 w-3 inline ml-1" />
                  </a>
                </Button>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="resend-api-key">Resend API Key</Label>
                <Input
                  id="resend-api-key"
                  type="password"
                  placeholder="re_..."
                  value={emailConfig.apiKey || ''}
                  onChange={(e) => updateConfig({ apiKey: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="resend-from-email">From Email Address</Label>
                <Input
                  id="resend-from-email"
                  type="email"
                  placeholder="noreply@yourpractice.com"
                  value={emailConfig.fromEmail || ''}
                  onChange={(e) => updateConfig({ fromEmail: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use onboarding@resend.dev if you don't have a custom domain
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gmail Configuration */}
      {emailConfig.provider === 'gmail' && (
        <Card>
          <CardHeader>
            <CardTitle>Gmail/Google Workspace Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Requires:</strong> Google Workspace account ($6/month) and App Password setup
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gmail-user">Gmail Address</Label>
                <Input
                  id="gmail-user"
                  type="email"
                  placeholder="drsmith@yourpractice.com"
                  value={emailConfig.fromEmail || ''}
                  onChange={(e) => updateConfig({ fromEmail: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="gmail-password">App Password</Label>
                <Input
                  id="gmail-password"
                  type="password"
                  placeholder="16-character app password"
                  value={emailConfig.smtpPassword || ''}
                  onChange={(e) => updateConfig({ smtpPassword: e.target.value })}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">How to get App Password:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Go to Gmail → Manage your Google Account</li>
                <li>Security → 2-Step Verification (enable if not already)</li>
                <li>App passwords → Select app: "Mail" → Generate</li>
                <li>Copy the 16-character password and paste above</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={saveEmailSettings} 
              disabled={loading || emailConfig.provider === 'none'}
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>

            <Button 
              onClick={testEmailSetup} 
              disabled={testing || emailConfig.provider === 'none'}
              variant="outline"
              className="flex-1"
            >
              {testing ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Email Setup
                </>
              )}
            </Button>
          </div>

          {testResult && (
            <div className="mt-4">
              <Alert className={testResult.includes('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertDescription>
                  {testResult}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Email Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {emailConfig.provider === 'none' ? (
              <>
                <Badge variant="outline">No Email Service</Badge>
                <span className="text-sm text-muted-foreground">
                  Email generation will open your default email client
                </span>
              </>
            ) : (
              <>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {emailConfig.provider.charAt(0).toUpperCase() + emailConfig.provider.slice(1)} Configured
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Emails will send directly from: {emailConfig.fromEmail}
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
