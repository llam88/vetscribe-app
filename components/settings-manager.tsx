"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Settings, 
  Zap, 
  Shield, 
  Database, 
  Bell,
  Palette,
  Stethoscope,
  TestTube,
  Crown,
  Activity,
  Info,
  Mail
} from "lucide-react"
import { UserEmailSettings } from "@/components/user-email-settings"

export function SettingsManager() {
  const [settings, setSettings] = useState({
    // Experimental Features - Enable dental charts by default
    enableDentalCharts: true,
    enablePimsIntegration: true, 
    enableAdvancedAnalytics: true,
    
    // AI Configuration  
    transcriptionQuality: 'high',
    soapNoteStyle: 'comprehensive',
    clientSummaryTone: 'professional',
    
    // Notifications
    emailNotifications: true,
    exportNotifications: false,
    systemAlerts: true,
    
    // Privacy & Data
    autoSave: true,
    dataRetention: '2-years',
    exportFormat: 'pdf',
    
    // UI Preferences
    darkMode: false,
    compactView: false,
    showTutorials: true
  })

  const [saving, setSaving] = useState(false)

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const saveSettings = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    alert('Settings saved successfully!')
  }

  const exportData = async () => {
    alert('Data export initiated! You will receive an email when ready.')
  }

  const clearData = async () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      alert('Data cleared successfully!')
    }
  }

  return (
    <div className="space-y-6">
      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            API Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Current Configuration:</strong> Advanced AI models configured for testing
              <br />
              The app uses state-of-the-art AI for veterinary note generation and audio transcription.
            </AlertDescription>
          </Alert>
          
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Transcription Quality</Label>
                <p className="text-sm text-muted-foreground">Higher quality = slower but more accurate</p>
              </div>
              <select 
                className="border rounded p-2"
                value={settings.transcriptionQuality}
                onChange={(e) => updateSetting('transcriptionQuality', e.target.value)}
              >
                <option value="standard">Standard</option>
                <option value="high">High</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">SOAP Note Style</Label>
                <p className="text-sm text-muted-foreground">Formatting style for generated notes</p>
              </div>
              <select 
                className="border rounded p-2"
                value={settings.soapNoteStyle}
                onChange={(e) => updateSetting('soapNoteStyle', e.target.value)}
              >
                <option value="concise">Concise</option>
                <option value="comprehensive">Comprehensive</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experimental Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Experimental Features
            <Badge variant="secondary">Beta</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enable cutting-edge features that are still in development
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-yellow-600" />
              <div>
                <Label className="text-base font-medium">🦷 AI Dental Charts</Label>
                <p className="text-sm text-muted-foreground">
                  Generate interactive dental charts from COHAT notes (Beta)
                </p>
              </div>
            </div>
            <Switch
              checked={settings.enableDentalCharts}
              onCheckedChange={(checked) => updateSetting('enableDentalCharts', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <Label className="text-base font-medium">PIMS Integration</Label>
                <p className="text-sm text-muted-foreground">
                  Connect with practice management systems (ezyVet, AVImark, etc.)
                </p>
              </div>
            </div>
            <Switch
              checked={settings.enablePimsIntegration}
              onCheckedChange={(checked) => updateSetting('enablePimsIntegration', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-purple-600" />
              <div>
                <Label className="text-base font-medium">Advanced Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Enhanced reporting and practice insights
                </p>
              </div>
            </div>
            <Switch
              checked={settings.enableAdvancedAnalytics}
              onCheckedChange={(checked) => updateSetting('enableAdvancedAnalytics', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Get notified about completed transcriptions</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Export Notifications</Label>
              <p className="text-sm text-muted-foreground">Notify when PDF exports are ready</p>
            </div>
            <Switch
              checked={settings.exportNotifications}
              onCheckedChange={(checked) => updateSetting('exportNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">System Alerts</Label>
              <p className="text-sm text-muted-foreground">Important system and feature updates</p>
            </div>
            <Switch
              checked={settings.systemAlerts}
              onCheckedChange={(checked) => updateSetting('systemAlerts', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Auto-save Appointments</Label>
              <p className="text-sm text-muted-foreground">Automatically save appointments to database</p>
            </div>
            <Switch
              checked={settings.autoSave}
              onCheckedChange={(checked) => updateSetting('autoSave', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Data Retention Period</Label>
              <p className="text-sm text-muted-foreground">How long to keep appointment data</p>
            </div>
            <select 
              className="border rounded p-2"
              value={settings.dataRetention}
              onChange={(e) => updateSetting('dataRetention', e.target.value)}
            >
              <option value="1-year">1 Year</option>
              <option value="2-years">2 Years</option>
              <option value="5-years">5 Years</option>
              <option value="indefinite">Indefinite</option>
            </select>
          </div>

          <Separator />

          <div className="flex gap-3">
            <Button onClick={exportData} variant="outline" className="flex-1">
              <Database className="h-4 w-4 mr-2" />
              Export All Data
            </Button>
            <Button onClick={clearData} variant="destructive" className="flex-1">
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* UI Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Interface Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Show Onboarding Tutorials</Label>
              <p className="text-sm text-muted-foreground">Display helpful guides for new features</p>
            </div>
            <Switch
              checked={settings.showTutorials}
              onCheckedChange={(checked) => updateSetting('showTutorials', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Compact View</Label>
              <p className="text-sm text-muted-foreground">Reduce spacing and show more content</p>
            </div>
            <Switch
              checked={settings.compactView}
              onCheckedChange={(checked) => updateSetting('compactView', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Set up your email provider to send client communications directly from SwiftVet
          </p>
        </CardHeader>
        <CardContent>
          <UserEmailSettings />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={saveSettings}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700"
        >
          {saving ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Settings className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
