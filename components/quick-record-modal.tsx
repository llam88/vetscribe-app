"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mic, ArrowRight } from "lucide-react"
import { createClientBrowser } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"

interface QuickRecordModalProps {
  isOpen: boolean
  onClose: () => void
}

export function QuickRecordModal({ isOpen, onClose }: QuickRecordModalProps) {
  const [patientName, setPatientName] = useState("")
  const [species, setSpecies] = useState("Dog")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const sb = createClientBrowser()

  const handleQuickRecord = async () => {
    if (!patientName.trim()) return

    setLoading(true)
    
    try {
      const { data: { user } } = await sb.auth.getUser()
      if (!user) {
        alert('Please sign in first')
        setLoading(false)
        return
      }

      // Auto-create appointment with minimal info
      const appointmentData = {
        user_id: user.id,
        patient_name: patientName.trim(),
        owner_name: "", // Can be filled later
        owner_phone: "", // Can be filled later
        species: species,
        breed: "", // Can be filled later
        appointment_type: "Walk-in Exam",
        chief_complaint: "Quick recording session",
        status: 'in_progress' // Mark as started
      }

      const { data, error } = await sb
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single()

      if (error) {
        console.error('Failed to create quick appointment:', error)
        alert('Failed to create appointment. Please try again.')
        setLoading(false)
        return
      }

      // Auto-create patient record (same as regular appointment workflow)
      try {
        console.log('Checking if patient exists:', patientName.trim())
        
        const { data: existingPatients, error: searchError } = await sb
          .from('patients')
          .select('id, name')
          .eq('name', patientName.trim())
          .eq('user_id', user.id)
          .limit(1)
        
        if (!existingPatients || existingPatients.length === 0) {
          console.log('Patient not found, creating new patient record')
          
          const patientData = {
            user_id: user.id,
            name: patientName.trim(),
            owner: 'Unknown Owner', // Can be updated later
            species: species,
            breed: '', // Can be updated later
            notes: `Auto-created from quick record session`,
            created_at: new Date().toISOString()
          }
          
          const { data: newPatient, error: patientError } = await sb
            .from('patients')
            .insert(patientData)
            .select()
          
          if (patientError) {
            console.warn('Failed to auto-create patient:', patientError)
            // Continue anyway - appointment is more important
          } else {
            console.log('✅ Patient auto-created from quick record:', newPatient[0])
          }
        } else {
          console.log('Patient already exists:', existingPatients[0])
        }
      } catch (patientError) {
        console.warn('Patient creation error (continuing anyway):', patientError)
      }

      // Close modal and redirect to recording page
      onClose()
      setPatientName("")
      setSpecies("Dog")
      
      // Go to the same recording page you already use
      router.push(`/appointments/${data.id}/record`)

    } catch (error) {
      console.error('Quick record error:', error)
      alert('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && patientName.trim()) {
      handleQuickRecord()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-red-500" />
            Quick Record
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="patient-name">Patient Name *</Label>
            <Input
              id="patient-name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter patient name (e.g., Buddy)"
              className="mt-1"
              autoFocus
            />
          </div>
          
          <div>
            <Label htmlFor="species">Species</Label>
            <Select value={species} onValueChange={setSpecies}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dog">Dog</SelectItem>
                <SelectItem value="Cat">Cat</SelectItem>
                <SelectItem value="Bird">Bird</SelectItem>
                <SelectItem value="Rabbit">Rabbit</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Quick Record:</strong> Creates a walk-in appointment and starts recording immediately. 
              You can add owner details, breed, and other info after recording.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleQuickRecord}
            disabled={!patientName.trim() || loading}
            className="flex-1 bg-red-500 hover:bg-red-600"
          >
            {loading ? (
              "Creating..."
            ) : (
              <>
                Start Recording
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
