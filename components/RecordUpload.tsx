"use client"
import { useState, useRef, useEffect } from "react"
import TemplatesPicker from "@/components/TemplatesPicker"
import { NoteTemplate } from "@/data/templates"
import { Mic, Play, Square, Pause, Clock, Upload } from "lucide-react"
import { createClientBrowser } from "@/lib/supabase-browser"

export default function RecordUpload() {
  const sb = createClientBrowser()
  
  // File upload state
  const [file, setFile] = useState<File | null>(null)
  
  // Content states
  const [transcription, setTranscription] = useState("")
  const [note, setNote] = useState("")
  const [summary, setSummary] = useState("")
  
  // UI states  
  const [loading, setLoading] = useState(false)
  const [template, setTemplate] = useState<NoteTemplate | null>(null)
  
  // Patient and appointment info
  const [patientInfo, setPatientInfo] = useState({
    name: "", species: "Dog", breed: "", age: "", sex: "Unknown", weight: "", owner: "", email: ""
  })
  
  // Audio recording states and refs - consolidated to avoid duplicates
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string>("")

  // Timer effect for recording duration
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
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording, isPaused])

  // Format recording time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return hours > 0 
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  // Start recording with proper configuration to avoid 2-minute limit
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
      
      // Find the best supported MIME type
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/mpeg'
      ]
      
      let mimeType = ''
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type
          break
        }
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000 // High quality
      })
      
      audioChunksRef.current = []
      
      // Handle data available - collect chunks without time limit
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      // Handle recording stop
      mediaRecorderRef.current.onstop = () => {
        const recordedBlob = new Blob(audioChunksRef.current, { type: mimeType })
        setAudioBlob(recordedBlob)
        setAudioUrl(URL.createObjectURL(recordedBlob))
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }
      
      // Start recording - request data every second to avoid browser limits
      mediaRecorderRef.current.start(1000)
      setIsRecording(true)
      setRecordingTime(0)
      
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

  async function handleTranscribe() {
    const audioToProcess = audioBlob || file
    if (!audioToProcess) return

    setLoading(true)
    try {
      const fd = new FormData()
      if (audioBlob) {
        fd.append("audio", audioBlob, "recording.webm")
      } else if (file) {
        fd.append("audio", file)
      }
      
      const tRes = await fetch("/api/transcribe", { method: "POST", body: fd })
      const tJson = await tRes.json()
      setTranscription(tJson.transcription || "")
    } catch (error) {
      console.error('Transcription error:', error)
      alert('Error transcribing audio. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleNote() {
    setLoading(true)
    try {
      const sRes = await fetch("/api/generate-soap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcription, patientInfo, visitType: "General", template })
      })
      const sJson = await sRes.json()
      setNote(sJson.note || "")
    } finally {
      setLoading(false)
    }
  }

  async function handleSummary() {
    setLoading(true)
    try {
      const sRes = await fetch("/api/client-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcription })
      })
      const sJson = await sRes.json()
      setSummary(sJson.summary || "")
    } finally {
      setLoading(false)
    }
  }

  async function exportPdf(title: string, content: string) {
    const res = await fetch("/api/export-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content })
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title.replace(/[^a-z0-9]/gi,"_").toLowerCase()}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  function field(name: keyof typeof patientInfo, label?: string) {
    return (
      <div>
        <label className="block text-xs text-gray-600">{label || name}</label>
        <input
          className="border rounded p-2 w-full"
          value={(patientInfo as any)[name]}
          onChange={e => setPatientInfo(p => ({ ...p, [name]: e.target.value }))}
          placeholder={label || name}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="p-3 border rounded bg-yellow-50 text-sm">
        Demo only — do not upload PHI. Audio is processed securely for transcription.
      </div>

      {/* Enhanced Recording with No Time Limits */}
      <div className="p-3 border rounded">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Live Recording - No 2 Minute Limit! 🎙️
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Record for as long as needed - this fixes the browser recording limitation
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                isRecording ? (isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse') : 'bg-gray-400'
              }`}></div>
              <span className="text-2xl font-mono font-bold">
                {formatTime(recordingTime)}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                isRecording ? (isPaused ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800') : 'bg-gray-100 text-gray-600'
              }`}>
                {isRecording ? (isPaused ? "Paused" : "Recording") : "Ready"}
              </span>
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            {!isRecording ? (
              <button 
                onClick={startRecording} 
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium flex items-center gap-2"
              >
                <Mic className="h-4 w-4" />
                Start Recording
              </button>
            ) : (
              <>
                {!isPaused ? (
                  <button 
                    onClick={pauseRecording}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Pause className="h-4 w-4" />
                    Pause
                  </button>
                ) : (
                  <button 
                    onClick={resumeRecording}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Resume
                  </button>
                )}
                <button 
                  onClick={stopRecording}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  Stop
                </button>
              </>
            )}
          </div>
        </div>

        {/* Playback */}
        {audioUrl && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800 font-medium mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recording Complete - {formatTime(recordingTime)}
            </p>
            <audio controls className="w-full mb-3">
              <source src={audioUrl} />
            </audio>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setAudioBlob(null)
                  setAudioUrl("")
                  setRecordingTime(0)
                }} 
                className="px-3 py-1 border rounded text-sm"
              >
                Record Again
              </button>
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                onClick={handleTranscribe}
                disabled={loading}
              >
                {loading ? "Processing..." : "Transcribe Recording"}
              </button>
            </div>
          </div>
        )}

        {/* File Upload Alternative */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium mb-2">Or upload audio file:</label>
          <input type="file" accept="audio/*" onChange={e => setFile(e.target.files?.[0] || null)} className="mb-2" />
          {file && (
            <button
              className="ml-0 px-3 py-2 rounded bg-black text-white disabled:opacity-50"
              onClick={handleTranscribe}
              disabled={!file || loading}
            >
              {loading ? "Transcribing..." : "Transcribe File"}
            </button>
          )}
        </div>
      </div>

      <div className="p-3 border rounded grid gap-2 sm:grid-cols-2">
        {field("name", "Name")}
        {field("owner", "Owner")}
        {field("species", "Species")}
        {field("breed", "Breed")}
        {field("sex", "Sex")}
        {field("age", "Age")}
        {field("weight", "Weight")}
      </div>

      <div className="p-3 border rounded">
        <label className="block text-sm font-medium mb-1">Pick a template</label>
        <TemplatesPicker onChange={t => setTemplate(t)} />
      </div>

      <div className="p-3 border rounded">
        <label className="block text-sm font-medium mb-1">Transcript</label>
        <textarea className="w-full border rounded p-2 min-h-[120px]" value={transcription} onChange={e => setTranscription(e.target.value)} />
        <div className="mt-2 flex gap-2">
          <button className="px-3 py-2 rounded bg-black text-white disabled:opacity-50" onClick={handleNote} disabled={!transcription || loading}>
            {loading ? "Generating..." : "Generate Note"}
          </button>
          <button className="px-3 py-2 rounded border disabled:opacity-50" onClick={handleSummary} disabled={!transcription || loading}>
            {loading ? "Working..." : "Client Summary"}
          </button>
        </div>
      </div>

      <div className="p-3 border rounded">
        <label className="block text-sm font-medium mb-1">Generated Note</label>
        <textarea className="w-full border rounded p-2 min-h-[200px]" value={note} onChange={e => setNote(e.target.value)} />
        <div className="mt-2 flex gap-2">
          <button className="px-3 py-2 rounded border" onClick={() => navigator.clipboard.writeText(note)}>Copy</button>
          <a className="px-3 py-2 rounded border" href={`data:text/plain;charset=utf-8,${encodeURIComponent(note)}`} download="note.txt">Download .txt</a>
          <button className="px-3 py-2 rounded border" onClick={() => exportPdf("Visit_Note", note)}>Download PDF</button>
        </div>
      </div>

      <div className="p-3 border rounded">
        <label className="block text-sm font-medium mb-1">Client Summary</label>
        <textarea className="w-full border rounded p-2 min-h-[140px]" value={summary} onChange={e => setSummary(e.target.value)} />
        <div className="mt-2 flex gap-2">
          <button className="px-3 py-2 rounded border" onClick={() => navigator.clipboard.writeText(summary)}>Copy</button>
          <a className="px-3 py-2 rounded border" href={`data:text/plain;charset=utf-8,${encodeURIComponent(summary)}`} download="summary.txt">Download .txt</a>
          <button className="px-3 py-2 rounded border" onClick={() => exportPdf("Client_Summary", summary)}>Download PDF</button>
        </div>
      </div>

      {/* Dental Chart Analysis - Only show if dental keywords detected */}
      {transcription && (transcription.toLowerCase().includes('dental') || 
                        transcription.toLowerCase().includes('teeth') || 
                        transcription.toLowerCase().includes('cohat') ||
                        transcription.toLowerCase().includes('cleaning') ||
                        transcription.toLowerCase().includes('gingivitis') ||
                        transcription.toLowerCase().includes('calculus')) && (
        <div className="p-3 border rounded bg-blue-50">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            🦷 Dental Chart Analysis
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Dental terminology detected in your notes! Generate an interactive dental chart.
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Generate Dental Chart
          </button>
        </div>
      )}
    </div>
  )
}
