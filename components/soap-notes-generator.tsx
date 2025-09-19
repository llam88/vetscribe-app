"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Zap, Copy, Download, Send, Save, RefreshCw, Settings, CheckCircle } from "lucide-react"

const visitTypes = [
  "Wellness Exam",
  "Vaccination",
  "Sick Visit",
  "Emergency",
  "Surgery",
  "Dental Cleaning",
  "Follow-up",
  "Consultation",
  "Diagnostic",
  "Preventive Care",
]

const commonFindings = [
  "Normal temperature",
  "Normal heart rate",
  "Normal respiratory rate",
  "Alert and responsive",
  "Good body condition",
  "Normal hydration",
  "Clear eyes",
  "Clean ears",
  "Healthy coat",
  "Normal gait",
  "No pain on palpation",
  "Normal lymph nodes",
]

const commonAssessments = [
  "Healthy animal",
  "Mild dehydration",
  "Overweight",
  "Underweight",
  "Dental disease",
  "Skin condition",
  "Ear infection",
  "Upper respiratory infection",
  "Gastrointestinal upset",
  "Arthritis",
  "Anxiety",
  "Behavioral issues",
]

export function SoapNotesGenerator() {
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    weight: "",
    owner: "",
    visitType: "",
  })

  const [soapNotes, setSoapNotes] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  })

  const [transcription, setTranscription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedNotes, setGeneratedNotes] = useState("")
  const [clientSummary, setClientSummary] = useState("")
  const [selectedFindings, setSelectedFindings] = useState<string[]>([])
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([])

  const handleGenerateFromTranscription = async () => {
    if (!transcription.trim()) {
      alert("Please enter a transcription first.")
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-soap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcription,
          patientInfo,
          visitType: patientInfo.visitType,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate SOAP notes")
      }

      const result = await response.json()
      setGeneratedNotes(result.soapNotes)
      setClientSummary(result.clientSummary)

      // Parse the generated notes into sections
      const sections = result.soapNotes.split(/(?=Subjective:|Objective:|Assessment:|Plan:)/i)
      const parsedNotes = {
        subjective:
          sections.find((s: string) => s.toLowerCase().startsWith("subjective:"))?.replace(/^subjective:\s*/i, "") || "",
        objective: sections.find((s: string) => s.toLowerCase().startsWith("objective:"))?.replace(/^objective:\s*/i, "") || "",
        assessment:
          sections.find((s: string) => s.toLowerCase().startsWith("assessment:"))?.replace(/^assessment:\s*/i, "") || "",
        plan: sections.find((s: string) => s.toLowerCase().startsWith("plan:"))?.replace(/^plan:\s*/i, "") || "",
      }
      setSoapNotes(parsedNotes)
    } catch (error) {
      console.error("Error generating SOAP notes:", error)
      alert("Error generating SOAP notes. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateFromTemplate = () => {
    const templateNotes = {
      subjective: `Owner reports that ${patientInfo.name} is here for ${patientInfo.visitType.toLowerCase()}. ${
        patientInfo.visitType === "Wellness Exam"
          ? "No specific concerns reported. Eating, drinking, and activity levels normal."
          : "Owner has specific concerns that need to be addressed."
      }`,
      objective: `${patientInfo.species} presenting for ${patientInfo.visitType.toLowerCase()}\n\nVital Signs:\n- Temperature: \n- Heart Rate: \n- Respiratory Rate: \n- Weight: ${patientInfo.weight || "___"} lbs\n\nPhysical Examination:\n${selectedFindings.map((finding) => `- ${finding}`).join("\n")}`,
      assessment: selectedAssessments.join("\n"),
      plan: `Treatment plan based on examination findings:\n- \n- \n- Follow-up as needed`,
    }
    setSoapNotes(templateNotes)
  }

  const handleFindingToggle = (finding: string) => {
    setSelectedFindings((prev) => (prev.includes(finding) ? prev.filter((f) => f !== finding) : [...prev, finding]))
  }

  const handleAssessmentToggle = (assessment: string) => {
    setSelectedAssessments((prev) =>
      prev.includes(assessment) ? prev.filter((a) => a !== assessment) : [...prev, assessment],
    )
  }

  const handleCopyNotes = () => {
    const fullNotes = `SOAP Notes for ${patientInfo.name}\n\nSubjective:\n${soapNotes.subjective}\n\nObjective:\n${soapNotes.objective}\n\nAssessment:\n${soapNotes.assessment}\n\nPlan:\n${soapNotes.plan}`
    navigator.clipboard.writeText(fullNotes)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">SOAP Notes Generator</h1>
          <p className="text-muted-foreground">Generate professional veterinary SOAP notes with AI assistance.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div>
                  <Label htmlFor="patient-name">Patient Name</Label>
                  <Input
                    id="patient-name"
                    value={patientInfo.name}
                    onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                    placeholder="e.g., Buddy"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="species">Species</Label>
                    <Select
                      value={patientInfo.species}
                      onValueChange={(value) => setPatientInfo({ ...patientInfo, species: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Species" />
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
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      value={patientInfo.age}
                      onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
                      placeholder="5 years"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="breed">Breed</Label>
                  <Input
                    id="breed"
                    value={patientInfo.breed}
                    onChange={(e) => setPatientInfo({ ...patientInfo, breed: e.target.value })}
                    placeholder="e.g., Golden Retriever"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      value={patientInfo.weight}
                      onChange={(e) => setPatientInfo({ ...patientInfo, weight: e.target.value })}
                      placeholder="52 lbs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="visit-type">Visit Type</Label>
                    <Select
                      value={patientInfo.visitType}
                      onValueChange={(value) => setPatientInfo({ ...patientInfo, visitType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {visitTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="owner">Owner Name</Label>
                  <Input
                    id="owner"
                    value={patientInfo.owner}
                    onChange={(e) => setPatientInfo({ ...patientInfo, owner: e.target.value })}
                    placeholder="e.g., John Smith"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Common Findings</Label>
                <div className="grid grid-cols-1 gap-2 mt-2 max-h-32 overflow-y-auto">
                  {commonFindings.map((finding) => (
                    <div key={finding} className="flex items-center space-x-2">
                      <Checkbox
                        id={finding}
                        checked={selectedFindings.includes(finding)}
                        onCheckedChange={() => handleFindingToggle(finding)}
                      />
                      <Label htmlFor={finding} className="text-xs">
                        {finding}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Common Assessments</Label>
                <div className="grid grid-cols-1 gap-2 mt-2 max-h-32 overflow-y-auto">
                  {commonAssessments.map((assessment) => (
                    <div key={assessment} className="flex items-center space-x-2">
                      <Checkbox
                        id={assessment}
                        checked={selectedAssessments.includes(assessment)}
                        onCheckedChange={() => handleAssessmentToggle(assessment)}
                      />
                      <Label htmlFor={assessment} className="text-xs">
                        {assessment}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleGenerateFromTemplate}
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
              >
                <Settings className="h-4 w-4 mr-2" />
                Generate Template
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transcription Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Transcription Input
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                placeholder="Paste your appointment transcription here, or type notes manually..."
                className="min-h-32"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerateFromTranscription}
                  disabled={isGenerating || !transcription.trim()}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate SOAP Notes
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SOAP Notes Editor */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  SOAP Notes
                  {generatedNotes && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Generated
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyNotes}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm" className="bg-accent hover:bg-accent/90">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="editor" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="editor">SOAP Editor</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="client">Client Summary</TabsTrigger>
                </TabsList>

                <TabsContent value="editor" className="mt-4 space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="subjective" className="text-sm font-semibold text-primary">
                        Subjective
                      </Label>
                      <Textarea
                        id="subjective"
                        value={soapNotes.subjective}
                        onChange={(e) => setSoapNotes({ ...soapNotes, subjective: e.target.value })}
                        placeholder="Owner's observations, chief complaint, history..."
                        className="mt-1 min-h-24"
                      />
                    </div>
                    <div>
                      <Label htmlFor="objective" className="text-sm font-semibold text-primary">
                        Objective
                      </Label>
                      <Textarea
                        id="objective"
                        value={soapNotes.objective}
                        onChange={(e) => setSoapNotes({ ...soapNotes, objective: e.target.value })}
                        placeholder="Physical examination findings, vital signs, diagnostic results..."
                        className="mt-1 min-h-32"
                      />
                    </div>
                    <div>
                      <Label htmlFor="assessment" className="text-sm font-semibold text-primary">
                        Assessment
                      </Label>
                      <Textarea
                        id="assessment"
                        value={soapNotes.assessment}
                        onChange={(e) => setSoapNotes({ ...soapNotes, assessment: e.target.value })}
                        placeholder="Clinical diagnosis, differential diagnoses..."
                        className="mt-1 min-h-24"
                      />
                    </div>
                    <div>
                      <Label htmlFor="plan" className="text-sm font-semibold text-primary">
                        Plan
                      </Label>
                      <Textarea
                        id="plan"
                        value={soapNotes.plan}
                        onChange={(e) => setSoapNotes({ ...soapNotes, plan: e.target.value })}
                        placeholder="Treatment plan, medications, follow-up instructions..."
                        className="mt-1 min-h-24"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="mt-4">
                  <div className="bg-muted/30 rounded-lg p-6">
                    <h3 className="font-bold text-lg mb-4">SOAP Notes for {patientInfo.name || "[Patient Name]"}</h3>
                    <div className="space-y-4 text-sm">
                      <div>
                        <h4 className="font-semibold text-primary mb-2">Subjective:</h4>
                        <p className="whitespace-pre-wrap">{soapNotes.subjective || "No subjective notes entered."}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary mb-2">Objective:</h4>
                        <p className="whitespace-pre-wrap">{soapNotes.objective || "No objective findings entered."}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary mb-2">Assessment:</h4>
                        <p className="whitespace-pre-wrap">{soapNotes.assessment || "No assessment entered."}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary mb-2">Plan:</h4>
                        <p className="whitespace-pre-wrap">{soapNotes.plan || "No treatment plan entered."}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="client" className="mt-4">
                  <div className="space-y-4">
                    <div className="bg-muted/30 rounded-lg p-4">
                      <h3 className="font-semibold mb-3">Client-Friendly Summary</h3>
                      {clientSummary ? (
                        <div className="text-sm whitespace-pre-wrap">{clientSummary}</div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Generate SOAP notes first to create a client summary.
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Summary
                      </Button>
                      <Button size="sm" className="bg-accent hover:bg-accent/90">
                        <Send className="h-4 w-4 mr-2" />
                        Email to Client
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
