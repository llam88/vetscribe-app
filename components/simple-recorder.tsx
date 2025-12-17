"use client"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { 
  Mic, 
  Upload, 
  FileText, 
  Mail,
  CheckCircle2,
  Copy,
  Download,
  Play,
  Square,
  Pause,
  Clock
} from "lucide-react"
import { createClientBrowser } from "@/lib/supabase-browser"
import { useToast } from "@/hooks/use-toast"
import { SOAPTemplateManager } from "@/components/soap-template-manager"
import { defaultSOAPTemplates, type SOAPTemplate } from "@/data/soap-templates"
import { SmartPimsTransfer } from "@/components/smart-pims-transfer"

interface SimpleRecorderProps {
  appointment: any
}

export function SimpleRecorder({ appointment }: SimpleRecorderProps) {
  const sb = createClientBrowser()
  const { toast } = useToast()
  
  // Audio recording states
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [savedAudioUrl, setSavedAudioUrl] = useState(appointment.audio_url || "")
  
  // Content states - ALWAYS VISIBLE
  const [transcription, setTranscription] = useState(appointment.transcription || "")
  const [soapNote, setSoapNote] = useState(appointment.soap_note || "")
  const [clientSummary, setClientSummary] = useState(appointment.client_summary || "")
  const [dentalChart, setDentalChart] = useState(appointment.dental_chart_data || null)
  
  // Dental chart states
  const [showDentalChart, setShowDentalChart] = useState(!!appointment.dental_chart_data)
  const [dentalKeywordsDetected, setDentalKeywordsDetected] = useState(false)
  
  // File upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Manual transcription
  const [manualTranscription, setManualTranscription] = useState("")
  
  // Template selection
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<SOAPTemplate | null>(null)
  
  // Check for dental keywords on component load if SOAP already exists
  useEffect(() => {
    if (soapNote) {
      const dentalKeywords = [
        'cohat', 'dental', 'teeth', 'tooth', 'periodontal', 'gingivitis', 
        'tartar', 'plaque', 'extraction', 'oral', 'gums', 'calculus',
        'dental cleaning', 'oral exam', 'dental disease', 'periodontitis'
      ]
      
      const hasDentalKeywords = dentalKeywords.some(keyword => 
        soapNote.toLowerCase().includes(keyword.toLowerCase())
      )
      
      setDentalKeywordsDetected(hasDentalKeywords)
    }
  }, [soapNote])

  // Load existing recording from storage if available
  useEffect(() => {
    const loadExistingRecording = async () => {
      if (appointment.audio_url && !audioUrl) {
        console.log('📥 Loading existing recording from storage:', appointment.audio_url)
        setSavedAudioUrl(appointment.audio_url)
        
        // Extract file path from stored URL or use directly if it's a path
        let filePath = appointment.audio_url
        
        // If it's a full URL, extract the path
        if (filePath.includes('/audio-recordings/')) {
          filePath = filePath.split('/audio-recordings/')[1]
        }
        
        // Generate signed URL for private bucket access
        try {
          const { data: signedUrlData, error: signedUrlError } = await sb.storage
            .from('audio-recordings')
            .createSignedUrl(filePath, 3600) // 1 hour expiry
          
          if (signedUrlError) {
            console.error('❌ Error creating signed URL:', signedUrlError)
            // Fallback to stored URL in case bucket is public
            setAudioUrl(appointment.audio_url)
          } else if (signedUrlData?.signedUrl) {
            console.log('✅ Generated signed URL for playback')
            setAudioUrl(signedUrlData.signedUrl)
          }
        } catch (error) {
          console.error('❌ Error loading recording:', error)
          setAudioUrl(appointment.audio_url)
        }
        
        // Show toast that recording is available
        toast({
          title: "🎙️ Recording Available",
          description: "Previously saved recording loaded. You can play or transcribe it.",
          duration: 3000,
        })
      }
    }
    
    loadExistingRecording()
  }, [appointment.audio_url])

  // Timer effect for recording
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRecording, isPaused])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return hours > 0 
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    // Prevent recording over existing saved recording
    if (savedAudioUrl) {
      const confirmMessage = transcription 
        ? 'This appointment already has a transcribed recording. To record again, please delete the existing recording first using "Delete & Re-record" button.'
        : 'You have a saved recording from a previous session. Starting a new recording will permanently delete the old one. Are you sure?'
      
      if (!confirm(confirmMessage)) {
        return
      }
      
      // If they confirm, clear the saved URL so new recording can be saved
      setSavedAudioUrl("")
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      })
      
      streamRef.current = stream
      
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/mpeg']
      let mimeType = ''
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type
          break
        }
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000
      })
      
      audioChunksRef.current = []
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = async () => {
        const recordedBlob = new Blob(audioChunksRef.current, { type: mimeType })
        const localUrl = URL.createObjectURL(recordedBlob)
        
        setAudioBlob(recordedBlob)
        setAudioUrl(localUrl)
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
        
        // AUTO-SAVE: Upload recording immediately
        console.log('🎙️ Recording stopped, auto-uploading...')
        toast({
          title: "💾 Saving Recording...",
          description: "Uploading to secure storage. Please wait...",
          duration: 3000,
        })
        
        try {
          await uploadRecordingToStorage(recordedBlob, recordingTime)
          console.log('✅ Auto-save completed successfully')
        } catch (error) {
          console.error('❌ Auto-save failed:', error)
          // Recording still available in browser for manual transcribe
        }
      }
      
      // Start recording - avoid 2-minute limit
      mediaRecorderRef.current.start(1000)
      setIsRecording(true)
      setRecordingTime(0)
      
      // Clear any uploaded file since we're recording live
      setUploadedFile(null)
      
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Microphone access denied. Please enable microphone permissions.')
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
    }
  }

  // AUTO-SAVE: Upload recording to Supabase Storage
  const uploadRecordingToStorage = async (blob: Blob, duration: number) => {
    try {
      setIsUploading(true)
      setUploadProgress(10)
      
      const { data: { user } } = await sb.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      setUploadProgress(20)
      
      // Create file path: {user_id}/{appointment_id}_{timestamp}.webm
      const timestamp = new Date().getTime()
      const fileName = `${appointment.id}_${timestamp}.webm`
      const filePath = `${user.id}/${fileName}`
      
      console.log('📤 Uploading recording to storage:', filePath)
      setUploadProgress(30)
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await sb.storage
        .from('audio-recordings')
        .upload(filePath, blob, {
          contentType: 'audio/webm',
          upsert: false
        })
      
      if (uploadError) {
        throw uploadError
      }
      
      console.log('✅ Upload successful:', uploadData)
      setUploadProgress(60)
      
      // Store the file path (not public URL) for signed URL generation later
      // This is critical for private bucket access
      const audioStoragePath = filePath
      setSavedAudioUrl(audioStoragePath)
      setUploadProgress(80)
      
      // Save file path to database (we'll generate signed URLs when needed)
      const { error: dbError } = await sb
        .from('appointments')
        .update({
          audio_url: audioStoragePath,  // Store path, not URL
          audio_duration: duration,
          audio_size_bytes: blob.size,
          recording_uploaded_at: new Date().toISOString()
        })
        .eq('id', appointment.id)
      
      if (dbError) {
        console.error('Database save error:', dbError)
        throw dbError
      }
      
      setUploadProgress(100)
      console.log('✅ Recording saved to database')
      
      toast({
        title: "✅ Recording Saved to Cloud!",
        description: `Recording uploaded successfully (${(blob.size / 1024 / 1024).toFixed(2)} MB, ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}). Accessible from any device.`,
        duration: 5000,
      })
      
      return audioStoragePath
      
    } catch (error) {
      console.error('❌ Upload failed:', error)
      
      // Retry mechanism
      toast({
        title: "⚠️ Upload Failed",
        description: "Retrying upload... Please don't close the page.",
        duration: 3000,
      })
      
      // Retry once after 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      try {
        // Retry upload
        const { data: { user } } = await sb.auth.getUser()
        if (!user) throw new Error('User not authenticated')
        
        const timestamp = new Date().getTime()
        const fileName = `${appointment.id}_${timestamp}_retry.webm`
        const filePath = `${user.id}/${fileName}`
        
        const { data: retryUploadData, error: retryError } = await sb.storage
          .from('audio-recordings')
          .upload(filePath, blob, {
            contentType: 'audio/webm',
            upsert: false
          })
        
        if (retryError) throw retryError
        
        // Store file path for signed URL generation
        await sb
          .from('appointments')
          .update({
            audio_url: filePath,  // Store path, not URL
            audio_duration: duration,
            audio_size_bytes: blob.size,
            recording_uploaded_at: new Date().toISOString()
          })
          .eq('id', appointment.id)
        
        setSavedAudioUrl(filePath)
        
        toast({
          title: "✅ Recording Saved (Retry Successful)!",
          description: "Recording uploaded after retry.",
          duration: 5000,
        })
        
        return filePath
        
      } catch (retryError) {
        console.error('❌ Retry failed:', retryError)
        
        toast({
          title: "❌ Upload Failed",
          description: "Could not save recording. Please try transcribing to save manually.",
          duration: 8000,
        })
        
        throw retryError
      }
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type.startsWith('audio/')) {
        setUploadedFile(file)
        toast({
          title: "📁 File Uploaded!",
          description: "Audio file ready. Click 'Generate Transcription' to process.",
          duration: 3000,
        })
      } else {
        alert('Please select an audio file')
      }
    }
  }

  const transcribeAudio = async () => {
    let audioToProcess: Blob | File | null = audioBlob || uploadedFile
    
    // If no blob in memory but we have a saved URL, fetch from storage
    if (!audioToProcess && savedAudioUrl) {
      console.log('📥 Fetching audio from storage for transcription...')
      try {
        // Generate signed URL if we have a path
        let fetchUrl = audioUrl
        if (!fetchUrl || fetchUrl.includes('403')) {
          // Re-generate signed URL
          let filePath = savedAudioUrl
          if (filePath.includes('/audio-recordings/')) {
            filePath = filePath.split('/audio-recordings/')[1]
          }
          
          const { data: signedUrlData, error: signedUrlError } = await sb.storage
            .from('audio-recordings')
            .createSignedUrl(filePath, 3600)
          
          if (signedUrlError || !signedUrlData?.signedUrl) {
            throw new Error('Could not access stored recording')
          }
          
          fetchUrl = signedUrlData.signedUrl
          setAudioUrl(fetchUrl)
        }
        
        // Fetch the audio file
        const response = await fetch(fetchUrl)
        if (!response.ok) {
          throw new Error('Failed to fetch stored recording')
        }
        
        audioToProcess = await response.blob()
        console.log('✅ Audio fetched from storage:', audioToProcess.size, 'bytes')
        
      } catch (error) {
        console.error('❌ Error fetching stored audio:', error)
        alert('Could not load the stored recording. Please try recording again.')
        return
      }
    }
    
    if (!audioToProcess) {
      alert('Please record audio or upload a file first')
      return
    }

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append("audio", audioToProcess, audioToProcess instanceof File ? audioToProcess.name : "recording.webm")
      
      console.log('Starting transcription for:', audioBlob ? 'live recording' : uploadedFile ? uploadedFile.name : 'stored recording')
      
      const response = await fetch("/api/transcribe", { method: "POST", body: fd })
      const result = await response.json()
      
      console.log('Transcription result:', result)
      
      if (!response.ok) {
        throw new Error(result.error || 'Transcription failed')
      }
      
      const newTranscription = result.transcription || ""
      console.log('Setting transcription with', newTranscription.length, 'characters')
      
      // FORCE UI UPDATE
      setTranscription(newTranscription)
      
      // Try to save to database (but don't let this block the UI)
      try {
        await sb
          .from('appointments')
          .update({ transcription: newTranscription })
          .eq('id', appointment.id)
        console.log('Transcription saved to database')
      } catch (dbError) {
        console.warn('Database save failed, but transcription is still available:', dbError)
      }
      
      toast({
        title: "✅ Transcription Complete!",
        description: `Generated ${newTranscription.length} characters. Ready to generate SOAP notes.`,
        duration: 4000,
      })
      
    } catch (error) {
      console.error('Transcription error:', error)
      toast({
        title: "❌ Transcription Failed",
        description: "Error transcribing audio. Please try again or check console for details.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const generateSOAP = async (template?: SOAPTemplate) => {
    if (!transcription) {
      alert('Generate transcription first')
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/generate-soap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          transcription, 
          patientInfo: {
            name: appointment.patient_name,
            species: appointment.species,
            owner: appointment.owner_name
          },
          visitType: appointment.appointment_type,
          template: template ? template.template : undefined
        })
      })
      
      const result = await response.json()
      const newSOAP = result.note || ""
      
      console.log('Generated SOAP note with', newSOAP.length, 'characters', template ? `using template: ${template.name}` : 'without template')
      
      // FORCE UI UPDATE
      setSoapNote(newSOAP)
      
      // Check for dental/COHAT keywords in SOAP note
      const dentalKeywords = [
        'cohat', 'dental', 'teeth', 'tooth', 'periodontal', 'gingivitis', 
        'tartar', 'plaque', 'extraction', 'oral', 'gums', 'calculus',
        'dental cleaning', 'oral exam', 'dental disease', 'periodontitis'
      ]
      
      const hasDentalKeywords = dentalKeywords.some(keyword => 
        newSOAP.toLowerCase().includes(keyword.toLowerCase())
      )
      
      setDentalKeywordsDetected(hasDentalKeywords)
      
      // Try to save to database
      try {
        await sb
          .from('appointments')
          .update({ 
            soap_note: newSOAP,
            status: 'completed'
          })
          .eq('id', appointment.id)
        console.log('SOAP note saved to database')
      } catch (dbError) {
        console.warn('Database save failed, but SOAP note is still available:', dbError)
      }
      
      const templateMessage = template ? ` using ${template.name} template` : ''
      if (hasDentalKeywords) {
        toast({
          title: "✅ SOAP Note Generated!",
          description: `${templateMessage} 🦷 Dental procedures detected - you can now generate a dental chart.`,
          duration: 6000,
        })
      } else {
        toast({
          title: "✅ SOAP Note Generated!",
          description: `${templateMessage} Created ${newSOAP.length} characters. Ready for client summary.`,
          duration: 4000,
        })
      }
      
    } catch (error) {
      console.error('SOAP generation error:', error)
      toast({
        title: "❌ SOAP Generation Failed",
        description: "Error generating SOAP note. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSelect = (template: SOAPTemplate) => {
    setSelectedTemplate(template)
    setShowTemplateSelector(false)
    generateSOAP(template)
  }

  const generateDentalChart = async () => {
    if (!soapNote) {
      alert('Please generate SOAP notes first')
      return
    }

    try {
      setLoading(true)
      
      console.log('Generating dental chart with:', {
        textLength: soapNote.length,
        species: appointment.species || 'dog',
        textPreview: soapNote.substring(0, 200) + '...'
      })

      const response = await fetch('/api/analyze-dental', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: soapNote,
          species: appointment.species || 'dog'
        })
      })

      console.log('Dental API Response Status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`API Error: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      
      console.log('Dental API Full Response:', {
        success: data.success,
        hasChartData: !!data.chartData,
        hasFindings: !!data.findings,
        findingsCount: data.findings ? Object.keys(data.findings).length : 0,
        error: data.error,
        summary: data.summary,
        data: data
      })
      
      if (data.success && data.chartData) {
        setDentalChart(data.chartData)
        setShowDentalChart(true)
        
        // Update appointment in database
        let updateResult = null
        try {
          console.log('Attempting to save dental chart data:', {
            appointmentId: appointment.id,
            chartDataType: typeof data.chartData,
            findingsType: typeof data.findings,
            hasChartData: !!data.chartData,
            hasFindings: !!data.findings
          })

          const { error, data: dbResult } = await sb
            .from('appointments')
            .update({ 
              dental_chart_data: data.chartData,
              dental_findings: data.findings || {}
            })
            .eq('id', appointment.id)
            .select()

          if (error) {
            console.error('Database error details:', {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code,
              error: error
            })
            console.warn('Dental chart save failed, but analysis still available in UI')
          } else {
            updateResult = dbResult
            console.log('Dental chart saved successfully to database:', updateResult)
          }
        } catch (dbError) {
          console.error('Database save exception:', dbError)
          console.warn('Database save failed, continuing with UI display')
        }
        
        if (updateResult && updateResult.length > 0) {
          toast({
            title: "🦷 Dental Chart Complete!",
            description: "AI analysis completed and saved to patient profile.",
            duration: 4000,
          })
        } else {
          toast({
            title: "🦷 Dental Chart Generated!",
            description: "AI analysis completed and displayed. Chart ready for review.",
            duration: 4000,
          })
        }
      } else if (data.success && !data.chartData) {
        // API succeeded but no chart data - show what we got
        console.warn('API succeeded but no chartData:', data)
        alert(`⚠️ Dental analysis completed but no chart data generated. Findings: ${JSON.stringify(data.findings || {})}`)
      } else if (data.success) {
        // API succeeded - show chart even with 0 findings (might be general conditions)
        console.log('Showing dental chart with general findings')
        setDentalChart(data.chartData)
        setShowDentalChart(true)
        alert(`✅ Dental analysis completed! Found ${Object.keys(data.findings || {}).length} specific findings.`)
      } else {
        // API failed - show detailed error
        const errorDetails = {
          success: data.success,
          error: data.error,
          hasFindings: !!data.findings,
          hasChartData: !!data.chartData,
          fullResponse: data
        }
        console.error('Dental analysis failed:', errorDetails)
        throw new Error(data.error || `No dental analysis generated. API Response: ${JSON.stringify(errorDetails)}`)
      }
    } catch (error: any) {
      console.error('Dental chart generation error:', error)
      alert(`❌ Failed to generate dental chart: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const generateClientSummary = async () => {
    if (!transcription) {
      alert('Generate transcription first')
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch("/api/client-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcription })
      })
      
      const result = await response.json()
      const newSummary = result.summary || ""
      
      console.log('Generated client summary with', newSummary.length, 'characters')
      
      // FORCE UI UPDATE
      setClientSummary(newSummary)
      
      // Try to save to database
      try {
        await sb
          .from('appointments')
          .update({ client_summary: newSummary })
          .eq('id', appointment.id)
        console.log('Client summary saved to database')
      } catch (dbError) {
        console.warn('Database save failed, but summary is still available:', dbError)
      }
      
      toast({
        title: "📧 Client Summary Generated!",
        description: `Created ${newSummary.length} characters. Ready to send to client.`,
        duration: 4000,
      })
      
    } catch (error) {
      console.error('Client summary error:', error)
      toast({
        title: "❌ Client Summary Failed", 
        description: "Error generating client summary. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Appointment Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{appointment.patient_name}</h2>
              <p className="text-muted-foreground">
                {appointment.appointment_type} • Owner: {appointment.owner_name} • {appointment.species}
              </p>
            </div>
            <Badge className="bg-blue-100 text-blue-800">
              Recording Session
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Live Recording - Unlimited Duration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Live Recording - No Time Limits! 🎙️
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Record unlimited duration audio directly in the browser
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Recording Controls */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${
                    isRecording ? (isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse') : 'bg-gray-400'
                  }`}></div>
                  <span className="text-2xl font-mono font-bold">
                    {formatTime(recordingTime)}
                  </span>
                  <Badge variant={isRecording ? (isPaused ? "secondary" : "destructive") : "outline"}>
                    {isRecording ? (isPaused ? "Paused" : "Recording") : "Ready"}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                {!isRecording ? (
                  <Button 
                    onClick={startRecording} 
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-3"
                    size="lg"
                  >
                    <Mic className="h-5 w-5 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <>
                    {!isPaused ? (
                      <Button onClick={pauseRecording} variant="outline" size="lg">
                        Pause
                      </Button>
                    ) : (
                      <Button onClick={resumeRecording} className="bg-blue-500 hover:bg-blue-600 text-white" size="lg">
                        Resume
                      </Button>
                    )}
                    <Button onClick={stopRecording} variant="destructive" size="lg">
                      Stop Recording
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Playback */}
            {audioUrl && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2 text-green-800">
                  <CheckCircle2 className="h-5 w-5" />
                  Recording Complete - {formatTime(recordingTime)}
                </h4>
                
                {/* Upload Progress Indicator */}
                {isUploading && (
                  <div className="mb-3 bg-blue-50 border border-blue-200 rounded p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span className="text-sm font-medium text-blue-900">
                        Uploading recording... {uploadProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {/* Saved Recording Indicator */}
                {savedAudioUrl && !isUploading && (
                  <div className="mb-3 bg-green-50 border border-green-200 rounded p-3">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        ✅ Recording saved to cloud storage - accessible from any device
                      </span>
                    </div>
                  </div>
                )}
                
                <audio controls className="w-full mb-3">
                  <source src={audioUrl} />
                </audio>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={transcribeAudio} 
                    disabled={loading || isUploading} 
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                  >
                    {loading ? "Processing..." : "Generate Transcription"}
                  </Button>
                  <Button 
                    onClick={() => {
                      if (confirm('Delete this recording and start over? This cannot be undone.')) {
                        setAudioBlob(null)
                        setAudioUrl("")
                        setRecordingTime(0)
                        setSavedAudioUrl("")
                      }
                    }} 
                    variant="outline" 
                    size="sm"
                    disabled={isUploading}
                  >
                    Delete & Re-record
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Upload Alternative */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            OR Upload Audio File
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <input
                type="file"
                onChange={handleFileUpload}
                accept="audio/*"
                className="hidden"
                id="audio-upload"
              />
              <Button asChild variant="outline">
                <label htmlFor="audio-upload" className="cursor-pointer">
                  Choose Audio File
                </label>
              </Button>
            </div>
            
            {uploadedFile && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium mb-2">📁 File Ready</h4>
                <p className="text-sm mb-2"><strong>File:</strong> {uploadedFile.name}</p>
                <p className="text-sm mb-4"><strong>Size:</strong> {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                <Button onClick={transcribeAudio} disabled={loading} className="w-full">
                  {loading ? "🔄 Processing Audio..." : "🚀 Generate Transcription"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Transcription Entry */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            OR Type Notes Manually ✍️
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Type your visit notes directly - perfect for handwritten notes or direct entry
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Manual Visit Notes</label>
              <Textarea
                value={manualTranscription}
                onChange={(e) => setManualTranscription(e.target.value)}
                rows={8}
                className="text-sm"
                placeholder="Type your visit notes here...

Example:
- Patient presented for routine wellness exam
- Physical examination findings: alert, responsive
- Vaccines updated, discussed nutrition
- Owner reports patient eating and drinking normally..."
              />
            </div>
            
            {manualTranscription.trim() && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-green-800">📝 Ready to Process</h4>
                <p className="text-sm mb-2"><strong>Characters:</strong> {manualTranscription.length}</p>
                <p className="text-sm mb-4"><strong>Words:</strong> {manualTranscription.split(' ').filter(w => w.length > 0).length}</p>
                <Button 
                  onClick={async () => {
                    setTranscription(manualTranscription)
                    
                    // Save to database immediately
                    try {
                      await sb.from('appointments')
                        .update({ transcription: manualTranscription })
                        .eq('id', appointment.id)
                      console.log('Manual transcription saved')
                    } catch (err: any) {
                      console.warn('Save failed:', err)
                    }
                    
                    toast({
                      title: "📝 Manual Transcription Set!",
                      description: "You can now generate SOAP notes from your text.",
                      duration: 3000,
                    })
                  }} 
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  ✍️ Use These Notes as Transcription
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transcription Display - ALWAYS VISIBLE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Transcription Results
            {transcription && (
              <Badge variant="secondary">{transcription.split(' ').length} words</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transcription ? (
              <>
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    ✅ Transcription generated successfully! {transcription.length} characters created.
                  </AlertDescription>
                </Alert>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Full Transcription Text</label>
                  <Textarea
                    value={transcription}
                    onChange={(e) => setTranscription(e.target.value)}
                    rows={15}
                    className="text-sm font-mono"
                  />
                </div>
                
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-2 sm:flex-wrap">
                  <Button 
                    onClick={() => navigator.clipboard.writeText(transcription)} 
                    variant="outline"
                    className="w-full sm:w-auto text-sm px-3 py-2"
                  >
                    <Copy className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Copy Transcription</span>
                  </Button>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      onClick={() => generateSOAP()} 
                      disabled={loading}
                      className="w-full sm:w-auto text-sm px-3 py-2"
                    >
                      <span className="truncate">
                        {loading ? "🔄 Generating..." : "📋 Generate SOAP Note"}
                      </span>
                    </Button>
                    <Button 
                      onClick={() => setShowTemplateSelector(true)} 
                      disabled={loading} 
                      variant="outline"
                      className="w-full sm:w-auto text-sm px-3 py-2"
                    >
                      <span className="truncate">📋 Use Template</span>
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={generateClientSummary} 
                    disabled={loading} 
                    variant="outline"
                    className="w-full sm:w-auto text-sm px-3 py-2"
                  >
                    <span className="truncate">
                      {loading ? "🔄 Generating..." : "📧 Generate Client Summary"}
                    </span>
                  </Button>
                  
                  {/* Dental Chart Generation - Mobile Optimized */}
                  {dentalKeywordsDetected && (
                    <Button 
                      onClick={generateDentalChart} 
                      disabled={!soapNote || loading}
                      className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto text-sm px-3 py-2"
                    >
                      <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="truncate">
                        {loading ? 'Analyzing...' : 'Generate AI Dental Chart 🦷'}
                      </span>
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg">No transcription yet</p>
                <p className="text-sm">Upload an audio file and click "Generate Transcription"</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SOAP Note Display - ALWAYS VISIBLE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Professional SOAP Note
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {soapNote ? (
              <>
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    ✅ Professional SOAP note generated! {soapNote.length} characters created.
                  </AlertDescription>
                </Alert>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">SOAP Note Content</label>
                  <Textarea
                    value={soapNote}
                    onChange={(e) => setSoapNote(e.target.value)}
                    rows={20}
                    className="text-sm"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Button onClick={() => navigator.clipboard.writeText(soapNote)} variant="outline" className="w-full sm:w-auto text-xs sm:text-sm px-2 sm:px-3">
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="truncate">Copy SOAP Note</span>
                  </Button>
                  <Button 
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/export-pdf', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            title: `SOAP Note - ${appointment.patient_name}`,
                            content: soapNote
                          })
                        })
                        const blob = await response.blob()
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `${appointment.patient_name}_soap_note.pdf`
                        a.click()
                        URL.revokeObjectURL(url)
                      } catch (error) {
                        console.error('PDF export error:', error)
                        alert('Error exporting PDF')
                      }
                    }}
                    variant="outline"
                    className="w-full sm:w-auto text-xs sm:text-sm px-2 sm:px-3"
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="truncate">Export PDF</span>
                  </Button>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-xs sm:text-sm px-2 sm:px-3">
                    <a href="/communication" className="flex items-center justify-center">
                      <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                      <span className="truncate">Send to Client</span>
                    </a>
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg">No SOAP note yet</p>
                <p className="text-sm">Generate transcription first, then click "Generate SOAP Note"</p>
                {transcription && (
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => generateSOAP()} disabled={loading}>
                      {loading ? "🔄 Generating SOAP Note..." : "📋 Generate SOAP Note"}
                    </Button>
                    <Button onClick={() => setShowTemplateSelector(true)} disabled={loading} variant="outline">
                      📋 Use Template
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Client Summary Display - ALWAYS VISIBLE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Client Summary (Pet Owner Version)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clientSummary ? (
              <>
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    ✅ Client summary generated! {clientSummary.length} characters created.
                  </AlertDescription>
                </Alert>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Client Summary Content</label>
                  <Textarea
                    value={clientSummary}
                    onChange={(e) => setClientSummary(e.target.value)}
                    rows={15}
                    className="text-sm"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Button onClick={() => navigator.clipboard.writeText(clientSummary)} variant="outline" className="w-full sm:w-auto text-xs sm:text-sm px-2 sm:px-3">
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="truncate">Copy Summary</span>
                  </Button>
                  <Button asChild className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-xs sm:text-sm px-2 sm:px-3">
                    <a href="/communication" className="flex items-center justify-center">
                      <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                      <span className="truncate">Email to Client</span>
                    </a>
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg">No client summary yet</p>
                <p className="text-sm">Generate transcription first, then click "Generate Client Summary"</p>
                {transcription && (
                  <Button onClick={generateClientSummary} disabled={loading} className="mt-4">
                    {loading ? "🔄 Generating Summary..." : "📧 Generate Client Summary"}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Professional Dental Chart Display - Matching main.py quality */}
      {(dentalChart && showDentalChart) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              🦷 AI-Generated Dental Chart
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Interactive dental chart - {dentalChart.species || 'Dog'} • {dentalChart.total_teeth || 0} total teeth • {dentalChart.affected_teeth || 0} findings
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  ✅ Dental chart analysis completed! Professional veterinary dental chart generated from your SOAP notes.
                </AlertDescription>
              </Alert>

              {/* Debug/Verification Section */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <details>
                  <summary className="cursor-pointer font-medium text-yellow-800 mb-2">
                    🔍 Verify AI Extraction Accuracy
                  </summary>
                  <div className="space-y-3 text-sm">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-1">What AI Found in Your Notes:</h5>
                      {dentalChart.findings && Object.keys(dentalChart.findings).length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {Object.entries(dentalChart.findings).map(([tooth, condition]) => (
                            <li key={tooth}>
                              <span className="font-medium">Tooth {tooth}:</span> {condition as string}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">No specific dental findings detected</p>
                      )}
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-700 mb-1">AI Summary:</h5>
                      <p className="text-gray-600 bg-white p-2 rounded border text-xs">
                        {dentalChart.summary || 'No summary available'}
                      </p>
                    </div>
                    
                    <div className="text-xs text-yellow-700 mt-2">
                      <strong>Not seeing expected findings?</strong> The AI only extracts explicitly mentioned dental conditions. Make sure your SOAP notes include specific tooth numbers and conditions (e.g., "Tooth 104 has calculus" rather than "some tartar present").
                    </div>
                  </div>
                </details>
              </div>

              {/* CSS for Professional Tooth Styling */}
              <style jsx>{`
                .tooth-normal {
                  background-color: #e5e7eb;
                  border: 2px solid #9ca3af;
                  width: 35px;
                  height: 45px;
                  margin: 2px;
                  display: inline-block;
                  text-align: center;
                  line-height: 45px;
                  font-size: 10px;
                  font-weight: bold;
                  border-radius: 8px 8px 4px 4px;
                  position: relative;
                  cursor: pointer;
                  transition: all 0.2s;
                }
                
                .tooth-finding {
                  border: 3px solid #dc2626 !important;
                  box-shadow: 0 0 8px rgba(220, 38, 38, 0.5);
                  background-color: #fee2e2 !important;
                }
                
                .tooth-normal:hover {
                  transform: scale(1.1);
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .jaw-section {
                  background: #f9fafb;
                  padding: 15px;
                  margin: 10px 0;
                  border-radius: 8px;
                  border: 1px solid #e5e7eb;
                }
                
                .tooth-label {
                  font-size: 8px;
                  color: #374151;
                }
              `}</style>
              
              {/* Professional Dental Chart Layout */}
              <div className="space-y-4">
                {/* Upper Jaw */}
                <div className="jaw-section">
                  <h3 className="font-bold mb-3 text-center">UPPER JAW (Maxilla)</h3>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-sm font-medium mb-2 text-center italic">Left Side</p>
                      <div className="flex justify-center">
                        <div className="flex flex-row-reverse">
                          {dentalChart.teeth_layout?.upper_left?.map((toothNum: string) => (
                            <div
                              key={toothNum}
                              className={`tooth-normal ${dentalChart.findings?.[toothNum] ? 'tooth-finding' : ''}`}
                              title={dentalChart.findings?.[toothNum] ? `Tooth ${toothNum}: ${dentalChart.findings[toothNum]}` : `Tooth ${toothNum}: Normal`}
                            >
                              {toothNum}
                            </div>
                          )) || []}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2 text-center italic">Right Side</p>
                      <div className="flex justify-center">
                        <div className="flex">
                          {dentalChart.teeth_layout?.upper_right?.map((toothNum: string) => (
                            <div
                              key={toothNum}
                              className={`tooth-normal ${dentalChart.findings?.[toothNum] ? 'tooth-finding' : ''}`}
                              title={dentalChart.findings?.[toothNum] ? `Tooth ${toothNum}: ${dentalChart.findings[toothNum]}` : `Tooth ${toothNum}: Normal`}
                            >
                              {toothNum}
                            </div>
                          )) || []}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Lower Jaw */}
                <div className="jaw-section">
                  <h3 className="font-bold mb-3 text-center">LOWER JAW (Mandible)</h3>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-sm font-medium mb-2 text-center italic">Left Side</p>
                      <div className="flex justify-center">
                        <div className="flex flex-row-reverse">
                          {dentalChart.teeth_layout?.lower_left?.map((toothNum: string) => (
                            <div
                              key={toothNum}
                              className={`tooth-normal ${dentalChart.findings?.[toothNum] ? 'tooth-finding' : ''}`}
                              title={dentalChart.findings?.[toothNum] ? `Tooth ${toothNum}: ${dentalChart.findings[toothNum]}` : `Tooth ${toothNum}: Normal`}
                            >
                              {toothNum}
                            </div>
                          )) || []}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2 text-center italic">Right Side</p>
                      <div className="flex justify-center">
                        <div className="flex">
                          {dentalChart.teeth_layout?.lower_right?.map((toothNum: string) => (
                            <div
                              key={toothNum}
                              className={`tooth-normal ${dentalChart.findings?.[toothNum] ? 'tooth-finding' : ''}`}
                              title={dentalChart.findings?.[toothNum] ? `Tooth ${toothNum}: ${dentalChart.findings[toothNum]}` : `Tooth ${toothNum}: Normal`}
                            >
                              {toothNum}
                            </div>
                          )) || []}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chart Legend & Analysis */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    📋 Chart Legend
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-200 border-2 border-gray-400 rounded" style={{ borderRadius: '4px 4px 2px 2px' }}></div>
                      <span>Normal Tooth</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-red-100 border-2 border-red-600 rounded shadow-sm" style={{ borderRadius: '4px 4px 2px 2px' }}></div>
                      <span>Finding Detected</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">🔍 Detected Findings</h4>
                  {dentalChart.findings && Object.keys(dentalChart.findings).length > 0 ? (
                    <div className="space-y-1 text-sm">
                      {Object.entries(dentalChart.findings).map(([tooth, condition]) => (
                        <div key={tooth} className="flex justify-between border-b pb-1">
                          <span className="font-medium">Tooth {tooth}:</span>
                          <span className="text-red-700 capitalize">{condition as string}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No specific dental pathology detected - Continue routine care</p>
                  )}
                </div>
              </div>
              
              {/* Professional Recommendations */}
              {dentalChart.recommendations && dentalChart.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-blue-900">🏥 Clinical Recommendations</h4>
                  <div className="space-y-3">
                    {dentalChart.recommendations.map((rec: any, index: number) => (
                      <div key={index} className={`p-3 rounded border-l-4 ${
                        rec.urgency === 'high' ? 'bg-red-50 border-red-500 text-red-900' :
                        rec.urgency === 'medium' ? 'bg-yellow-50 border-yellow-500 text-yellow-900' :
                        'bg-green-50 border-green-500 text-green-900'
                      }`}>
                        <div className="font-semibold">{rec.type}</div>
                        <div className="text-sm mt-1">{rec.description}</div>
                        <div className="text-xs mt-1 opacity-75">
                          Priority: {rec.urgency?.toUpperCase()} • Teeth affected: {rec.count || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(dentalChart, null, 2))}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Chart Data
                </Button>
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  size="sm"
                >
                  🖨️ Print Chart
                </Button>
                <Button size="sm" onClick={async () => {
                  try {
                    // Get current user
                    const { data: { user } } = await sb.auth.getUser()
                    if (!user) {
                      alert('Please sign in to view patient profile')
                      return
                    }
                    
                    // Find patient ID by name and user_id
                    console.log('Searching for patient:', appointment.patient_name, 'for user:', user.id)
                    const { data: patients, error } = await sb
                      .from('patients')
                      .select('id, name')
                      .eq('name', appointment.patient_name)
                      .eq('user_id', user.id)
                      .limit(1)
                    
                    if (error) {
                      console.error('Error searching for patient:', error)
                      alert('Error finding patient profile. Check console for details.')
                      return
                    }
                    
                    console.log('Found patients:', patients)
                    
                    if (patients && patients.length > 0) {
                      console.log('Navigating to patient profile:', patients[0].id)
                      window.location.href = `/patients/${patients[0].id}`
                    } else {
                      alert(`Patient "${appointment.patient_name}" not found in your records. The patient record may not have been created properly when the appointment was made.`)
                    }
                  } catch (error) {
                    console.error('Error accessing patient profile:', error)
                    alert('Error accessing patient profile. Check console for details.')
                  }
                }}>
                  👤 View Patient Profile
                </Button>
                <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                  <a href="/communication">
                    📧 Email to Client
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center w-full">
            <Button variant="outline" asChild className="w-full sm:w-auto text-xs sm:text-sm px-2 sm:px-3">
              <a href="/appointments" className="flex items-center justify-center">
                <span className="truncate">← Back to Appointments</span>
              </a>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto text-xs sm:text-sm px-2 sm:px-3">
              <a href="/dashboard" className="flex items-center justify-center">
                <span className="truncate">🏠 Dashboard</span>
              </a>
            </Button>
            {(soapNote || clientSummary) && (
              <Button asChild className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto text-xs sm:text-sm px-2 sm:px-3">
                <a href="/communication" className="flex items-center justify-center">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="truncate">Send Client Email</span>
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* PIMS Transfer */}
      <SmartPimsTransfer appointmentData={{
        ...appointment,
        soap_note: soapNote,
        client_summary: clientSummary,
        transcription: transcription
      }} />
      
      {/* Debug Information */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm">Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-xs space-y-1">
              <p><strong>Appointment ID:</strong> {appointment.id}</p>
              <p><strong>Transcription:</strong> {transcription?.length || 0} characters {transcription ? '✅' : '❌'}</p>
              <p><strong>SOAP Note:</strong> {soapNote?.length || 0} characters {soapNote ? '✅' : '❌'}</p>
              <p><strong>Client Summary:</strong> {clientSummary?.length || 0} characters {clientSummary ? '✅' : '❌'}</p>
              <p><strong>Audio Source:</strong> {
                audioBlob ? `Live recording (${formatTime(recordingTime)})` :
                uploadedFile?.name || 'None'
              }</p>
              <p><strong>Status:</strong> {loading ? '🔄 Processing...' : 'Ready'}</p>
            </div>
        </CardContent>
      </Card>

      {/* Template Selector Dialog */}
      <Dialog open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Select SOAP Note Template
            </DialogTitle>
            <DialogDescription>
              Choose a professional template to structure your SOAP note generation
            </DialogDescription>
          </DialogHeader>
          
          <SOAPTemplateManager 
            showSelector={true}
            onSelectTemplate={handleTemplateSelect}
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateSelector(false)}>
              Cancel
            </Button>
            <Button onClick={() => generateSOAP()} disabled={loading}>
              Generate Without Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
