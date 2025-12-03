"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CalendarDays, FileText, Users, TrendingUp, Clock, AlertCircle, Activity, Stethoscope, Plus, Mic, ChevronDown, Calendar } from "lucide-react"
import Link from "next/link"
import { QuickRecordModal } from "@/components/quick-record-modal"
import { useState } from "react"

interface DashboardOverviewProps {
  appointments: any[]
  patients: any[]
  stats: {
    totalAppointments: number
    totalPatients: number
    todayAppointments: number
    recentActivity: any[]
  }
}

export function DashboardOverview({ appointments, patients, stats }: DashboardOverviewProps) {
  const [showQuickRecord, setShowQuickRecord] = useState(false)
  // Calculate additional metrics
  const completionRate = appointments.length > 0 ? Math.round((appointments.filter(apt => apt.soap_note).length / appointments.length) * 100) : 0
  const avgProcessingTime = "2.3 min" // This would be calculated from actual data
  
  // Get species distribution
  const speciesCount = patients.reduce((acc: any, patient) => {
    const species = patient.species || 'Unknown'
    acc[species] = (acc[species] || 0) + 1
    return acc
  }, {})
  
  const mostCommonSpecies = Object.keys(speciesCount).length > 0 
    ? Object.entries(speciesCount).reduce((a: any, b: any) => a[1] > b[1] ? a : b)[0]
    : 'N/A'

  // Recent activities from appointments
  const recentActivities = stats.recentActivity.map((appointment, index) => ({
    id: appointment.id || index,
    type: appointment.type || "appointment",
    patient: `${appointment.patient_name || 'Unknown'} (${appointment.species || 'Unknown'})`,
    action: appointment.soap_note ? "SOAP note generated" : "Transcription completed",
    time: new Date(appointment.created_at).toLocaleString(),
    status: appointment.soap_note ? "completed" : "pending"
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-muted-foreground">Welcome back! Here's your practice overview.</p>
        </div>
        <div className="flex gap-2">
          {/* Smart Recording Button with Dropdown */}
          <DropdownMenu>
            <div className="flex">
              {/* Main Quick Record Button */}
              <Button 
                size="sm" 
                className="bg-red-500 hover:bg-red-600 rounded-r-none"
                onClick={() => setShowQuickRecord(true)}
              >
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
              
              {/* Dropdown Arrow */}
              <DropdownMenuTrigger asChild>
                <Button 
                  size="sm" 
                  className="bg-red-500 hover:bg-red-600 rounded-l-none border-l border-red-400 px-2"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </div>
            
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowQuickRecord(true)}>
                <Mic className="h-4 w-4 mr-2" />
                Quick Record (Walk-in)
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/appointments">
                  <Calendar className="h-4 w-4 mr-2" />
                  Record Scheduled Appointment
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Quick Record Modal */}
        <QuickRecordModal 
          isOpen={showQuickRecord} 
          onClose={() => setShowQuickRecord(false)} 
        />
      </div>

      {/* Main Statistics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.todayAppointments} completed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              Most common: {mostCommonSpecies}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <Progress value={completionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              SOAP notes generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Speed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProcessingTime}</div>
            <p className="text-xs text-muted-foreground">
              Average per appointment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Information Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* AI Features Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              AI Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Audio Transcription</span>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">SOAP Note Generation</span>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Client Summaries</span>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Dental Analysis</span>
              <Badge variant="secondary">Available</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Species Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Species Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(speciesCount).slice(0, 4).map(([species, count]) => (
              <div key={species} className="flex items-center justify-between">
                <span className="text-sm">{species}</span>
                <div className="flex items-center gap-2">
                  <div className="w-12 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((count as number / Math.max(stats.totalPatients, 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{String(count)}</span>
                </div>
              </div>
            ))}
            {Object.keys(speciesCount).length === 0 && (
              <p className="text-sm text-muted-foreground">No patients registered yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.length > 0 ? recentActivities.slice(0, 4).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`h-2 w-2 rounded-full mt-2 ${
                  activity.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.patient}</p>
                  <p className="text-xs text-muted-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/appointments" className="block">
                <div className="flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group cursor-pointer">
                  <div className="rounded-full bg-red-100 p-2 group-hover:bg-red-200">
                    <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Create Appointment</span>
                </div>
              </Link>

            <Link href="/patients?new=true" className="block">
              <div className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group cursor-pointer">
                <div className="rounded-full bg-blue-100 p-2 group-hover:bg-blue-200">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Add Patient</span>
              </div>
            </Link>

            <Link href="/patients" className="block">
              <div className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group cursor-pointer">
                <div className="rounded-full bg-green-100 p-2 group-hover:bg-green-200">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-medium">Export Data</span>
              </div>
            </Link>

            <Link href="/communication" className="block">
              <div className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group cursor-pointer">
                <div className="rounded-full bg-purple-100 p-2 group-hover:bg-purple-200">
                  <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Send Email</span>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Appointments if available */}
      {appointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointments.slice(0, 3).map((appointment, index) => (
                <div key={appointment.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{appointment.patient_name || 'Unknown Patient'}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.species || 'Unknown'} • {new Date(appointment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={appointment.soap_note ? "default" : "secondary"}>
                    {appointment.soap_note ? "Complete" : "In Progress"}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/appointments">
                <Button variant="outline" size="sm" className="w-full">
                  View All Appointments
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}