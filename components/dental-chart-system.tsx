"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Smile, Save, Printer, RotateCcw, AlertTriangle, CheckCircle } from "lucide-react"

// Dental conditions and their colors
const dentalConditions = {
  healthy: { color: "#22c55e", label: "Healthy" },
  tartar: { color: "#eab308", label: "Tartar/Plaque" },
  gingivitis: { color: "#f97316", label: "Gingivitis" },
  periodontal: { color: "#ef4444", label: "Periodontal Disease" },
  missing: { color: "#6b7280", label: "Missing" },
  fractured: { color: "#8b5cf6", label: "Fractured" },
  extracted: { color: "#000000", label: "Extracted" },
  crown: { color: "#3b82f6", label: "Crown/Cap" },
  root_canal: { color: "#ec4899", label: "Root Canal" },
}

// Dog dental chart layout (adult dog - 42 teeth)
const dogDentalChart = {
  upper: {
    right: [
      { id: "101", number: "101", name: "I1", type: "incisor" },
      { id: "102", number: "102", name: "I2", type: "incisor" },
      { id: "103", number: "103", name: "I3", type: "incisor" },
      { id: "104", number: "104", name: "C", type: "canine" },
      { id: "105", number: "105", name: "P1", type: "premolar" },
      { id: "106", number: "106", name: "P2", type: "premolar" },
      { id: "107", number: "107", name: "P3", type: "premolar" },
      { id: "108", number: "108", name: "P4", type: "premolar" },
      { id: "109", number: "109", name: "M1", type: "molar" },
      { id: "110", number: "110", name: "M2", type: "molar" },
    ],
    left: [
      { id: "201", number: "201", name: "I1", type: "incisor" },
      { id: "202", number: "202", name: "I2", type: "incisor" },
      { id: "203", number: "203", name: "I3", type: "incisor" },
      { id: "204", number: "204", name: "C", type: "canine" },
      { id: "205", number: "205", name: "P1", type: "premolar" },
      { id: "206", number: "206", name: "P2", type: "premolar" },
      { id: "207", number: "207", name: "P3", type: "premolar" },
      { id: "208", number: "208", name: "P4", type: "premolar" },
      { id: "209", number: "209", name: "M1", type: "molar" },
      { id: "210", number: "210", name: "M2", type: "molar" },
    ],
  },
  lower: {
    right: [
      { id: "401", number: "401", name: "I1", type: "incisor" },
      { id: "402", number: "402", name: "I2", type: "incisor" },
      { id: "403", number: "403", name: "I3", type: "incisor" },
      { id: "404", number: "404", name: "C", type: "canine" },
      { id: "405", number: "405", name: "P1", type: "premolar" },
      { id: "406", number: "406", name: "P2", type: "premolar" },
      { id: "407", number: "407", name: "P3", type: "premolar" },
      { id: "408", number: "408", name: "P4", type: "premolar" },
      { id: "409", number: "409", name: "M1", type: "molar" },
      { id: "410", number: "410", name: "M2", type: "molar" },
      { id: "411", number: "411", name: "M3", type: "molar" },
    ],
    left: [
      { id: "301", number: "301", name: "I1", type: "incisor" },
      { id: "302", number: "302", name: "I2", type: "incisor" },
      { id: "303", number: "303", name: "I3", type: "incisor" },
      { id: "304", number: "304", name: "C", type: "canine" },
      { id: "305", number: "305", name: "P1", type: "premolar" },
      { id: "306", number: "306", name: "P2", type: "premolar" },
      { id: "307", number: "307", name: "P3", type: "premolar" },
      { id: "308", number: "308", name: "P4", type: "premolar" },
      { id: "309", number: "309", name: "M1", type: "molar" },
      { id: "310", number: "310", name: "M2", type: "molar" },
      { id: "311", number: "311", name: "M3", type: "molar" },
    ],
  },
}

interface ToothCondition {
  toothId: string
  condition: keyof typeof dentalConditions
  notes: string
  date: string
  severity?: "mild" | "moderate" | "severe"
}

export function DentalChartSystem() {
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    species: "Dog",
    breed: "",
    age: "",
    owner: "",
    date: new Date().toISOString().split("T")[0],
  })

  const [toothConditions, setToothConditions] = useState<ToothCondition[]>([])
  const [selectedCondition, setSelectedCondition] = useState<keyof typeof dentalConditions>("healthy")
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null)
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [toothNote, setToothNote] = useState("")
  const [dentalNotes, setDentalNotes] = useState("")
  const [treatmentPlan, setTreatmentPlan] = useState("")

  const handleToothClick = (toothId: string) => {
    setSelectedTooth(toothId)
    const existingCondition = toothConditions.find((tc) => tc.toothId === toothId)
    if (existingCondition) {
      setToothNote(existingCondition.notes)
      setIsAddingNote(true)
    } else {
      // Apply selected condition to tooth
      const newCondition: ToothCondition = {
        toothId,
        condition: selectedCondition,
        notes: "",
        date: new Date().toISOString().split("T")[0],
      }
      setToothConditions([...toothConditions.filter((tc) => tc.toothId !== toothId), newCondition])
    }
  }

  const handleSaveToothNote = () => {
    if (selectedTooth) {
      const updatedConditions = toothConditions.map((tc) =>
        tc.toothId === selectedTooth ? { ...tc, notes: toothNote } : tc,
      )
      setToothConditions(updatedConditions)
      setIsAddingNote(false)
      setSelectedTooth(null)
      setToothNote("")
    }
  }

  const getToothCondition = (toothId: string) => {
    return toothConditions.find((tc) => tc.toothId === toothId)
  }

  const getToothColor = (toothId: string) => {
    const condition = getToothCondition(toothId)
    return condition ? dentalConditions[condition.condition].color : "#f3f4f6"
  }

  const clearAllConditions = () => {
    setToothConditions([])
  }

  const generateDentalReport = () => {
    const conditionCounts = Object.keys(dentalConditions).reduce(
      (acc, condition) => {
        acc[condition] = toothConditions.filter((tc) => tc.condition === condition).length
        return acc
      },
      {} as Record<string, number>,
    )

    const problemTeeth = toothConditions.filter((tc) => tc.condition !== "healthy")

    return {
      summary: conditionCounts,
      problemTeeth,
      totalTeeth: 42,
      healthyTeeth: conditionCounts.healthy || 0,
      problemCount: problemTeeth.length,
    }
  }

  const ToothComponent = ({ tooth, quadrant }: { tooth: any; quadrant: string }) => {
    const condition = getToothCondition(tooth.id)
    const color = getToothColor(tooth.id)

    return (
      <div
        className="relative group cursor-pointer"
        onClick={() => handleToothClick(tooth.id)}
        title={`${tooth.number} - ${tooth.name} (${tooth.type})`}
      >
        <div
          className="w-8 h-10 rounded-t-lg border-2 border-gray-300 hover:border-primary transition-colors flex items-center justify-center text-xs font-medium"
          style={{ backgroundColor: color, color: color === "#000000" ? "white" : "black" }}
        >
          {tooth.name}
        </div>
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
          {tooth.number}
        </div>
        {condition && condition.condition !== "healthy" && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-2 h-2 text-white" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dental Chart System</h1>
          <p className="text-muted-foreground">
            Interactive dental charting and treatment planning for veterinary patients.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={clearAllConditions}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear All
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print Chart
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            <Save className="h-4 w-4 mr-2" />
            Save Chart
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Patient Info & Tools */}
        <div className="lg:col-span-1 space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="patient-name">Patient Name</Label>
                <Input
                  id="patient-name"
                  value={patientInfo.name}
                  onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                  placeholder="e.g., Buddy"
                />
              </div>
              <div>
                <Label htmlFor="species">Species</Label>
                <Select
                  value={patientInfo.species}
                  onValueChange={(value) => setPatientInfo({ ...patientInfo, species: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dog">Dog</SelectItem>
                    <SelectItem value="Cat">Cat</SelectItem>
                  </SelectContent>
                </Select>
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
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  value={patientInfo.age}
                  onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
                  placeholder="e.g., 5 years"
                />
              </div>
              <div>
                <Label htmlFor="owner">Owner</Label>
                <Input
                  id="owner"
                  value={patientInfo.owner}
                  onChange={(e) => setPatientInfo({ ...patientInfo, owner: e.target.value })}
                  placeholder="e.g., John Smith"
                />
              </div>
              <div>
                <Label htmlFor="exam-date">Exam Date</Label>
                <Input
                  id="exam-date"
                  type="date"
                  value={patientInfo.date}
                  onChange={(e) => setPatientInfo({ ...patientInfo, date: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dental Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dental Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {Object.entries(dentalConditions).map(([key, condition]) => (
                  <div
                    key={key}
                    onClick={() => setSelectedCondition(key as keyof typeof dentalConditions)}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedCondition === key ? "bg-primary/10 border border-primary" : "hover:bg-muted/50"
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: condition.color }}
                    />
                    <span className="text-sm">{condition.label}</span>
                    {selectedCondition === key && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Select a condition above, then click on teeth to apply it.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dental Chart */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smile className="h-5 w-5 text-primary" />
                Interactive Dental Chart - {patientInfo.species}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Upper Jaw */}
                <div className="space-y-4">
                  <h3 className="text-center font-semibold text-lg">Upper Jaw (Maxilla)</h3>
                  <div className="flex justify-center gap-8">
                    {/* Upper Right */}
                    <div className="space-y-2">
                      <h4 className="text-center text-sm font-medium text-muted-foreground">Right</h4>
                      <div className="flex gap-1">
                        {dogDentalChart.upper.right.map((tooth) => (
                          <ToothComponent key={tooth.id} tooth={tooth} quadrant="upper-right" />
                        ))}
                      </div>
                    </div>
                    {/* Upper Left */}
                    <div className="space-y-2">
                      <h4 className="text-center text-sm font-medium text-muted-foreground">Left</h4>
                      <div className="flex gap-1">
                        {dogDentalChart.upper.left.map((tooth) => (
                          <ToothComponent key={tooth.id} tooth={tooth} quadrant="upper-left" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lower Jaw */}
                <div className="space-y-4">
                  <h3 className="text-center font-semibold text-lg">Lower Jaw (Mandible)</h3>
                  <div className="flex justify-center gap-8">
                    {/* Lower Right */}
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {dogDentalChart.lower.right.map((tooth) => (
                          <ToothComponent key={tooth.id} tooth={tooth} quadrant="lower-right" />
                        ))}
                      </div>
                      <h4 className="text-center text-sm font-medium text-muted-foreground">Right</h4>
                    </div>
                    {/* Lower Left */}
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {dogDentalChart.lower.left.map((tooth) => (
                          <ToothComponent key={tooth.id} tooth={tooth} quadrant="lower-left" />
                        ))}
                      </div>
                      <h4 className="text-center text-sm font-medium text-muted-foreground">Left</h4>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-4 pt-4 border-t border-border">
                  {Object.entries(dentalConditions).map(([key, condition]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded border border-gray-300"
                        style={{ backgroundColor: condition.color }}
                      />
                      <span className="text-xs">{condition.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes and Report */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dental Examination Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={dentalNotes}
                  onChange={(e) => setDentalNotes(e.target.value)}
                  placeholder="Enter general dental examination findings, oral health observations, and any additional notes..."
                  className="min-h-32"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Treatment Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  placeholder="Enter recommended treatments, procedures, home care instructions, and follow-up schedule..."
                  className="min-h-32"
                />
              </CardContent>
            </Card>
          </div>

          {/* Dental Report Summary */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Dental Report Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <h4 className="font-medium">Overall Health</h4>
                  <div className="space-y-1">
                    {(() => {
                      const report = generateDentalReport()
                      return (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Total Teeth:</span>
                            <span>{report.totalTeeth}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Healthy:</span>
                            <span className="text-green-600">{report.healthyTeeth}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Problems:</span>
                            <span className="text-red-600">{report.problemCount}</span>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Condition Breakdown</h4>
                  <div className="space-y-1">
                    {(() => {
                      const report = generateDentalReport()
                      return Object.entries(report.summary)
                        .filter(([_, count]) => count > 0)
                        .map(([condition, count]) => (
                          <div key={condition} className="flex justify-between text-sm">
                            <span className="capitalize">{condition.replace("_", " ")}:</span>
                            <span>{count}</span>
                          </div>
                        ))
                    })()}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Priority Actions</h4>
                  <div className="space-y-1 text-sm">
                    {(() => {
                      const report = generateDentalReport()
                      const priorities = []
                      if (report.summary.periodontal > 0) priorities.push("Periodontal treatment needed")
                      if (report.summary.fractured > 0) priorities.push("Fractured teeth require attention")
                      if (report.summary.tartar > 3) priorities.push("Professional cleaning recommended")
                      if (priorities.length === 0) priorities.push("Continue routine dental care")
                      return priorities.map((priority, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3 text-orange-500" />
                          <span>{priority}</span>
                        </div>
                      ))
                    })()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tooth Note Dialog */}
      <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note for Tooth {selectedTooth}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tooth-note">Tooth-Specific Notes</Label>
              <Textarea
                id="tooth-note"
                value={toothNote}
                onChange={(e) => setToothNote(e.target.value)}
                placeholder="Enter specific observations, treatments, or notes for this tooth..."
                className="min-h-24"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingNote(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveToothNote} className="bg-primary hover:bg-primary/90">
                Save Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
