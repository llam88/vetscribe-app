"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mic, Square, Play, Pause, Zap, FileText, Clock, Upload } from "lucide-react"

type RecordingState = "idle" | "recording" | "paused" | "processing" | "completed"

export function RecordingInterface() {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle")
  const [recordingTime, setRecordingTime] = useState(0)
  const [patientName, setPatientName] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [visitType, setVisitType] = useState("")
  const [notes, setNotes] = useState("")
  const [transcription, setTranscription] = useState("")
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (recordingState === "recording") {
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [recordingState])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setRecordingState("recording")
      setRecordingTime(0)
    } catch (error) {
      console.error("Error starting recording:", error)
      alert("Could not access microphone. Please check permissions.")
    }
  }

  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause()
      setRecordingState("paused")
    }
  }

  const handleResumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume()
      setRecordingState("recording")
    }
  }

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    setRecordingState("idle")
    setRecordingTime(0)
  }

  const handleScribble = async () => {
    if (!audioBlob) {
      alert("No audio recording found. Please record audio first.")
      return
    }

    setRecordingState("processing")

    try {
      // First, transcribe the audio
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.wav")
      formData.append("patientName", patientName)
      formData.append("ownerName", ownerName)
      formData.append("visitType", visitType)

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Transcription failed")
      }

      const result = await response.json()
      setTranscription(result.transcription)
      setNotes(result.soapNotes)
      setRecordingState("completed")
    } catch (error) {
      console.error("Error processing audio:", error)
      alert("Error processing audio. Please try again.")
      setRecordingState("idle")
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("audio/")) {
      setAudioBlob(file)
      setRecordingTime(0)
    } else {
      alert("Please select a valid audio file.")
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Appointment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="patient-name">Patient Name</Label>
            <Input
              id="patient-name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g., Buddy"
            />
          </div>
          <div>
            <Label htmlFor="owner-name">Owner Name</Label>
            <Input
              id="owner-name"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="e.g., John Smith"
            />
          </div>
          <div>
            <Label htmlFor="visit-type">Visit Type</Label>
            <Input
              id="visit-type"
              value={visitType}
              onChange={(e) => setVisitType(e.target.value)}
              placeholder="e.g., Wellness Exam"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recording Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              Recording Controls
            </div>
            {recordingState !== "idle" && (
              <Badge variant={recordingState === "recording" ? "destructive" : "secondary"}>
                {recordingState === "recording" && "● "}
                {recordingState.charAt(0).toUpperCase() + recordingState.slice(1)}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recording Timer */}
          <div className="text-center">
            <div className="text-4xl font-mono font-bold text-foreground mb-2">{formatTime(recordingTime)}</div>
            <p className="text-sm text-muted-foreground">
              {recordingState === "recording" && "Recording in progress..."}
              {recordingState === "paused" && "Recording paused"}
              {recordingState === "idle" && "Ready to record"}
              {recordingState === "processing" && "Processing with AI..."}
              {recordingState === "completed" && "Notes ready for review"}
            </p>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
            {recordingState === "idle" && (
              <>
                <Button
                  size="lg"
                  onClick={handleStartRecording}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Mic className="h-5 w-5 mr-2" />
                  Start Recording
                </Button>
                <div className="relative">
                  <Button size="lg" variant="outline" asChild>
                    <label htmlFor="audio-upload" className="cursor-pointer">
                      <Upload className="h-5 w-5 mr-2" />
                      Upload Audio
                    </label>
                  </Button>
                  <input
                    id="audio-upload"
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </>
            )}

            {recordingState === "recording" && (
              <>
                <Button size="lg" variant="outline" onClick={handlePauseRecording}>
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </Button>
                <Button size="lg" variant="destructive" onClick={handleStopRecording}>
                  <Square className="h-5 w-5 mr-2" />
                  Stop
                </Button>
              </>
            )}

            {recordingState === "paused" && (
              <>
                <Button
                  size="lg"
                  onClick={handleResumeRecording}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Resume
                </Button>
                <Button size="lg" variant="destructive" onClick={handleStopRecording}>
                  <Square className="h-5 w-5 mr-2" />
                  Stop
                </Button>
              </>
            )}
          </div>

          {/* Scribble Button */}
          {(recordingState === "paused" || recordingTime > 0 || audioBlob) &&
            recordingState !== "processing" &&
            recordingState !== "completed" && (
              <div className="text-center pt-4 border-t border-border">
                <Button
                  size="lg"
                  onClick={handleScribble}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  disabled={!audioBlob}
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Scribble - Generate Notes
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  AI will process your recording and generate SOAP notes
                </p>
              </div>
            )}

          {/* Processing State */}
          {recordingState === "processing" && (
            <div className="text-center pt-4 border-t border-border">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">Processing with AI...</span>
              </div>
              <p className="text-xs text-muted-foreground">This usually takes 10-30 seconds</p>
            </div>
          )}
        </CardContent>
      </Card>

      {recordingState === "completed" && transcription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Transcription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              className="min-h-32 text-sm"
              placeholder="Audio transcription will appear here..."
            />
          </CardContent>
        </Card>
      )}

      {/* Generated Notes */}
      {recordingState === "completed" && notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Generated SOAP Notes
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Ready
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-96 font-mono text-sm"
              placeholder="Your AI-generated SOAP notes will appear here..."
            />
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Generated with AI
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(notes)}>
                  Copy to Clipboard
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Save & Continue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
