"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Edit, Save, Send, Copy, Download, Calendar, Clock, User, Heart } from "lucide-react"

// Mock data for notes
const mockNotes = [
  {
    id: 1,
    patientName: "Buddy",
    ownerName: "John Smith",
    visitType: "Wellness Exam",
    date: "2024-01-15",
    time: "10:30 AM",
    status: "completed",
    content: `SOAP Notes for Buddy

Subjective:
Annual wellness examination. Owner reports Buddy is eating well, active, and no concerns. Regular exercise and good appetite.

Objective:
- Temperature: 101.2°F (normal)
- Heart rate: 110 bpm
- Respiratory rate: 22 breaths/min
- Weight: 52 lbs (ideal)
- Body condition score: 5/9
- Alert and responsive
- Dental: Grade 1 tartar buildup
- Heart and lungs: Normal
- Abdomen: Soft, non-painful

Assessment:
Healthy adult dog. Mild dental tartar noted.

Plan:
- Continue current diet and exercise routine
- Dental cleaning recommended within 6 months
- Annual vaccines due - administered today
- Heartworm test negative
- Continue monthly heartworm prevention
- Recheck in 12 months for annual exam`,
    tags: ["wellness", "vaccines", "dental"],
  },
  {
    id: 2,
    patientName: "Luna",
    ownerName: "Sarah Johnson",
    visitType: "Vaccination",
    date: "2024-01-15",
    time: "11:15 AM",
    status: "completed",
    content: `SOAP Notes for Luna

Subjective:
Routine vaccination appointment. Owner reports Luna is doing well, eating normally, and active.

Objective:
- Temperature: 100.8°F (normal)
- Weight: 28 lbs
- Alert and responsive
- Physical exam unremarkable

Assessment:
Healthy cat presenting for routine vaccinations.

Plan:
- FVRCP vaccine administered
- Rabies vaccine administered
- No adverse reactions observed
- Monitor for any reactions over next 24-48 hours
- Next vaccines due in 1 year`,
    tags: ["vaccination", "routine"],
  },
  {
    id: 3,
    patientName: "Max",
    ownerName: "Mike Davis",
    visitType: "Dental Cleaning",
    date: "2024-01-15",
    time: "2:00 PM",
    status: "draft",
    content: `SOAP Notes for Max

Subjective:
Dental cleaning procedure. Owner reports bad breath and difficulty eating hard food.

Objective:
- Pre-anesthetic bloodwork: Normal
- Grade 3 periodontal disease
- Multiple loose teeth identified
- Dental radiographs taken

Assessment:
Severe periodontal disease with multiple affected teeth.

Plan:
- Dental cleaning completed
- 3 teeth extracted (premolars)
- Antibiotic therapy prescribed
- Pain management protocol
- Soft food diet for 1 week
- Recheck in 2 weeks`,
    tags: ["dental", "surgery", "anesthesia"],
  },
]

export function NotesManager() {
  const [selectedNote, setSelectedNote] = useState(mockNotes[0])
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(selectedNote.content)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredNotes = mockNotes.filter((note) => {
    const matchesSearch =
      note.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.visitType.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || note.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleSave = () => {
    // In a real app, this would save to a database
    setSelectedNote({ ...selectedNote, content: editedContent })
    setIsEditing(false)
  }

  const handleEdit = () => {
    setEditedContent(selectedNote.content)
    setIsEditing(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notes Management</h1>
          <p className="text-muted-foreground">Review, edit, and manage your appointment notes.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Notes List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Notes</CardTitle>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => {
                      setSelectedNote(note)
                      setIsEditing(false)
                    }}
                    className={`p-4 cursor-pointer border-l-4 hover:bg-muted/50 transition-colors ${
                      selectedNote.id === note.id ? "border-l-primary bg-muted/30" : "border-l-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm text-foreground">{note.patientName}</h3>
                      <Badge
                        variant={note.status === "completed" ? "secondary" : "default"}
                        className={
                          note.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : note.status === "draft"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                        }
                      >
                        {note.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        {note.ownerName}
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="h-3 w-3" />
                        {note.visitType}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {note.date} at {note.time}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Note Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {selectedNote.patientName} - {selectedNote.visitType}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {selectedNote.ownerName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {selectedNote.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {selectedNote.time}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <>
                      <Button variant="outline" size="sm" onClick={handleEdit}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button size="sm" className="bg-accent hover:bg-accent/90">
                        <Send className="h-4 w-4 mr-2" />
                        Send to Client
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSave} className="bg-primary hover:bg-primary/90">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="notes" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="notes">SOAP Notes</TabsTrigger>
                  <TabsTrigger value="summary">Client Summary</TabsTrigger>
                  <TabsTrigger value="billing">Billing Codes</TabsTrigger>
                </TabsList>

                <TabsContent value="notes" className="mt-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="min-h-96 font-mono text-sm"
                        placeholder="Enter your SOAP notes here..."
                      />
                    </div>
                  ) : (
                    <div className="bg-muted/30 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap font-mono text-sm text-foreground leading-relaxed">
                        {selectedNote.content}
                      </pre>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="summary" className="mt-4">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Client-Friendly Summary</h3>
                    <div className="space-y-3 text-sm">
                      <p>
                        <strong>Visit Summary:</strong> {selectedNote.patientName} came in today for a{" "}
                        {selectedNote.visitType.toLowerCase()}. Overall, your pet is doing well!
                      </p>
                      <p>
                        <strong>What We Found:</strong> During the examination, we checked {selectedNote.patientName}'s
                        vital signs, weight, and overall health. Everything looks good.
                      </p>
                      <p>
                        <strong>Recommendations:</strong> Continue with the current care routine. We'll see you again
                        for the next scheduled visit.
                      </p>
                      <p>
                        <strong>Questions?</strong> Please don't hesitate to call us if you have any concerns about{" "}
                        {selectedNote.patientName}'s health.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="billing" className="mt-4">
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="primary-code">Primary Procedure Code</Label>
                        <Input id="primary-code" placeholder="e.g., 99213" />
                      </div>
                      <div>
                        <Label htmlFor="diagnosis-code">Diagnosis Code</Label>
                        <Input id="diagnosis-code" placeholder="e.g., Z00.00" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="additional-codes">Additional Codes</Label>
                      <Textarea
                        id="additional-codes"
                        placeholder="Enter any additional billing codes..."
                        className="h-24"
                      />
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
