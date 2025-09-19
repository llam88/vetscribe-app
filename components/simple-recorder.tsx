"use client"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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

interface SimpleRecorderProps {
  appointment: any
}

export function SimpleRecorder({ appointment }: SimpleRecorderProps) {
  const sb = createClientBrowser()
  
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
      
      mediaRecorderRef.current.onstop = () => {
        const recordedBlob = new Blob(audioChunksRef.current, { type: mimeType })
        setAudioBlob(recordedBlob)
        setAudioUrl(URL.createObjectURL(recordedBlob))
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
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
        alert('✅ File uploaded! Click "Generate Transcription" to process.')
      } else {
        alert('Please select an audio file')
      }
    }
  }

  const transcribeAudio = async () => {
    const audioToProcess = audioBlob || uploadedFile
    if (!audioToProcess) {
      alert('Please record audio or upload a file first')
      return
    }

    setLoading(true)
    try {
      const fd = new FormData()
      if (audioBlob) {
        fd.append("audio", audioBlob, "recording.webm")
      } else if (uploadedFile) {
        fd.append("audio", uploadedFile)
      }
      
      console.log('Starting transcription for:', audioBlob ? 'live recording' : uploadedFile?.name)
      
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
      
      alert(`✅ Transcription complete! Generated ${newTranscription.length} characters.`)
      
    } catch (error) {
      console.error('Transcription error:', error)
      alert('❌ Error transcribing audio. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  const generateSOAP = async () => {
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
          visitType: appointment.appointment_type
        })
      })
      
      const result = await response.json()
      const newSOAP = result.note || ""
      
      console.log('Generated SOAP note with', newSOAP.length, 'characters')
      
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
      
      alert(hasDentalKeywords 
        ? `✅ SOAP note generated! 🦷 Dental procedures detected - you can now generate a dental chart.`
        : `✅ SOAP note generated! ${newSOAP.length} characters created.`)
      
    } catch (error) {
      console.error('SOAP generation error:', error)
      alert('❌ Error generating SOAP note.')
    } finally {
      setLoading(false)
    }
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
          alert('✅ AI dental chart analysis completed! Chart saved to patient profile.')
        } else {
          alert('✅ AI dental chart analysis completed! Chart displayed (database save may need column setup - see console).')
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
      
      alert(`✅ Client summary generated! ${newSummary.length} characters created.`)
      
    } catch (error) {
      console.error('Client summary error:', error)
      alert('❌ Error generating client summary.')
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
                <audio controls className="w-full mb-3">
                  <source src={audioUrl} />
                </audio>
                <div className="flex gap-2">
                  <Button onClick={() => {
                    setAudioBlob(null)
                    setAudioUrl("")
                    setRecordingTime(0)
                  }} variant="outline" size="sm">
                    Record Again
                  </Button>
                  <Button onClick={transcribeAudio} disabled={loading} size="sm">
                    {loading ? "Processing..." : "Generate Transcription"}
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
                    
                    alert(`✅ Manual transcription set! You can now generate SOAP notes.`)
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
                
                <div className="flex gap-2">
                  <Button onClick={() => navigator.clipboard.writeText(transcription)} variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Transcription
                  </Button>
                  <Button onClick={generateSOAP} disabled={loading}>
                    {loading ? "🔄 Generating..." : "📋 Generate SOAP Note"}
                  </Button>
                  <Button onClick={generateClientSummary} disabled={loading} variant="outline">
                    {loading ? "🔄 Generating..." : "📧 Generate Client Summary"}
                  </Button>
                  
                  {/* Dental Chart Generation - Only shown when dental keywords detected */}
                  {dentalKeywordsDetected && (
                    <Button 
                      onClick={generateDentalChart} 
                      disabled={!soapNote || loading}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {loading ? 'Analyzing...' : 'Generate AI Dental Chart 🦷'}
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
                
                <div className="flex gap-2">
                  <Button onClick={() => navigator.clipboard.writeText(soapNote)} variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy SOAP Note
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
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <a href="/communication">
                      <Mail className="h-4 w-4 mr-2" />
                      Send to Client
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
                  <Button onClick={generateSOAP} disabled={loading} className="mt-4">
                    {loading ? "🔄 Generating SOAP Note..." : "📋 Generate SOAP Note"}
                  </Button>
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
                
                <div className="flex gap-2">
                  <Button onClick={() => navigator.clipboard.writeText(clientSummary)} variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Summary
                  </Button>
                  <Button asChild className="bg-green-600 hover:bg-green-700">
                    <a href="/communication">
                      <Mail className="h-4 w-4 mr-2" />
                      Email to Client
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
                  // Find patient ID by name
                  const { data: patients } = await sb
                    .from('patients')
                    .select('id')
                    .eq('name', appointment.patient_name)
                    .limit(1)
                  
                  if (patients && patients.length > 0) {
                    window.location.href = `/patients/${patients[0].id}`
                  } else {
                    alert('Patient profile not found. Please check the Patients tab.')
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
          <div className="flex gap-4 justify-center">
            <Button variant="outline" asChild>
              <a href="/appointments">← Back to Appointments</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/dashboard">🏠 Dashboard</a>
            </Button>
            {(soapNote || clientSummary) && (
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <a href="/communication">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Client Email
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
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
    </div>
  )
}
