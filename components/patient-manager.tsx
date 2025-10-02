"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Edit, Trash2, Eye, Calendar, Phone, Mail, MapPin, Heart, User } from "lucide-react"
import { createClientBrowser } from "@/lib/supabase-browser"
import { useEffect } from "react"

// Mock patient data
const mockPatients = [
  {
    id: 1,
    name: "Buddy",
    species: "Dog",
    breed: "Golden Retriever",
    age: "5 years",
    weight: "52 lbs",
    color: "Golden",
    microchip: "123456789012345",
    owner: {
      name: "John Smith",
      phone: "(555) 123-4567",
      email: "john.smith@email.com",
      address: "123 Main St, Anytown, ST 12345",
    },
    medicalHistory: [
      {
        date: "2024-01-15",
        type: "Wellness Exam",
        notes: "Annual wellness exam. Patient healthy, vaccines updated.",
        veterinarian: "Dr. Johnson",
      },
      {
        date: "2023-12-10",
        type: "Dental Cleaning",
        notes: "Routine dental cleaning. Grade 1 tartar removed.",
        veterinarian: "Dr. Smith",
      },
    ],
    vaccinations: [
      { vaccine: "DHPP", date: "2024-01-15", due: "2025-01-15" },
      { vaccine: "Rabies", date: "2024-01-15", due: "2027-01-15" },
      { vaccine: "Bordetella", date: "2023-11-20", due: "2024-11-20" },
    ],
    allergies: ["None known"],
    medications: ["Heartworm prevention (monthly)"],
    status: "Active",
    lastVisit: "2024-01-15",
    nextAppointment: "2024-07-15",
  },
  {
    id: 2,
    name: "Luna",
    species: "Cat",
    breed: "Domestic Shorthair",
    age: "3 years",
    weight: "10 lbs",
    color: "Calico",
    microchip: "987654321098765",
    owner: {
      name: "Sarah Johnson",
      phone: "(555) 987-6543",
      email: "sarah.j@email.com",
      address: "456 Oak Ave, Somewhere, ST 67890",
    },
    medicalHistory: [
      {
        date: "2024-01-15",
        type: "Vaccination",
        notes: "Annual vaccines administered. Patient in good health.",
        veterinarian: "Dr. Wilson",
      },
    ],
    vaccinations: [
      { vaccine: "FVRCP", date: "2024-01-15", due: "2025-01-15" },
      { vaccine: "Rabies", date: "2024-01-15", due: "2027-01-15" },
    ],
    allergies: ["Chicken"],
    medications: ["Flea prevention (monthly)"],
    status: "Active",
    lastVisit: "2024-01-15",
    nextAppointment: "2025-01-15",
  },
  {
    id: 3,
    name: "Max",
    species: "Dog",
    breed: "German Shepherd",
    age: "8 years",
    weight: "75 lbs",
    color: "Black and Tan",
    microchip: "456789123456789",
    owner: {
      name: "Mike Davis",
      phone: "(555) 456-7890",
      email: "mike.davis@email.com",
      address: "789 Pine St, Elsewhere, ST 54321",
    },
    medicalHistory: [
      {
        date: "2024-01-15",
        type: "Dental Surgery",
        notes: "Dental cleaning with 3 extractions. Recovery going well.",
        veterinarian: "Dr. Brown",
      },
    ],
    vaccinations: [
      { vaccine: "DHPP", date: "2023-12-01", due: "2024-12-01" },
      { vaccine: "Rabies", date: "2023-12-01", due: "2026-12-01" },
    ],
    allergies: ["Beef"],
    medications: ["Pain medication (post-surgery)", "Antibiotics"],
    status: "Active",
    lastVisit: "2024-01-15",
    nextAppointment: "2024-01-29",
  },
]

export function PatientManager() {
  const sb = createClientBrowser()
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSpecies, setFilterSpecies] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isAddingPatient, setIsAddingPatient] = useState(false)
  const [isEditingPatient, setIsEditingPatient] = useState(false)
  const [editingPatient, setEditingPatient] = useState<any>(null)

  // Load patients from database
  const loadPatients = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await sb.auth.getUser()
      if (!user) return

      const { data, error } = await sb
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Patients table may not exist yet:', error)
        // Fallback to mock data if database isn't set up
        setPatients(mockPatients)
        setSelectedPatient(mockPatients[0])
      } else {
        // Transform database patients to match UI structure
        const transformedPatients = (data || []).map(patient => ({
          ...patient,
          owner: {
            name: patient.owner || 'Unknown Owner',
            phone: patient.owner_phone || '',
            email: patient.owner_email || '',
            address: ''
          },
          medicalHistory: [],
          vaccinations: [],
          allergies: ['None known'],
          medications: [],
          status: 'Active',
          lastVisit: new Date(patient.created_at).toISOString().split('T')[0],
          nextAppointment: ''
        }))
        
        setPatients(transformedPatients)
        if (transformedPatients.length > 0) {
          setSelectedPatient(transformedPatients[0])
        }
      }
    } catch (error) {
      console.warn('Error loading patients:', error)
      // Fallback to mock data
      setPatients(mockPatients)
      setSelectedPatient(mockPatients[0])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPatients()
  }, [])

  const [newPatient, setNewPatient] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    weight: "",
    color: "",
    microchip: "",
    owner: {
      name: "",
      phone: "",
      email: "",
      address: "",
    },
    allergies: [""],
    medications: [""],
    status: "Active",
  })

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.breed.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSpecies = filterSpecies === "all" || patient.species.toLowerCase() === filterSpecies
    const matchesStatus = filterStatus === "all" || patient.status.toLowerCase() === filterStatus
    return matchesSearch && matchesSpecies && matchesStatus
  })

  const handleAddPatient = () => {
    const id = Math.max(...patients.map((p) => p.id)) + 1
    const patientToAdd = {
      ...newPatient,
      id,
      medicalHistory: [],
      vaccinations: [],
      lastVisit: new Date().toISOString().split("T")[0],
      nextAppointment: "",
    }
    setPatients([...patients, patientToAdd])
    setIsAddingPatient(false)
    setNewPatient({
      name: "",
      species: "",
      breed: "",
      age: "",
      weight: "",
      color: "",
      microchip: "",
      owner: { name: "", phone: "", email: "", address: "" },
      allergies: [""],
      medications: [""],
      status: "Active",
    })
  }

  const handleEditPatient = (patient: any) => {
    setEditingPatient({ ...patient })
    setIsEditingPatient(true)
  }

  const handleSaveEdit = () => {
    if (editingPatient) {
      setPatients(patients.map(p => p.id === editingPatient.id ? editingPatient : p))
      if (selectedPatient.id === editingPatient.id) {
        setSelectedPatient(editingPatient)
      }
      setIsEditingPatient(false)
      setEditingPatient(null)
    }
  }

  const handleDeletePatient = (patientId: number) => {
    setPatients(patients.filter((p) => p.id !== patientId))
    if (selectedPatient.id === patientId) {
      setSelectedPatient(patients.find((p) => p.id !== patientId) || patients[0])
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patient Management</h1>
          <p className="text-muted-foreground">Manage patient records, medical history, and appointments.</p>
        </div>
        <Dialog open={isAddingPatient} onOpenChange={setIsAddingPatient}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add New Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="patient-name">Patient Name</Label>
                  <Input
                    id="patient-name"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    placeholder="e.g., Buddy"
                  />
                </div>
                <div>
                  <Label htmlFor="species">Species</Label>
                  <Select
                    value={newPatient.species}
                    onValueChange={(value) => setNewPatient({ ...newPatient, species: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select species" />
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
                  <Label htmlFor="breed">Breed</Label>
                  <Input
                    id="breed"
                    value={newPatient.breed}
                    onChange={(e) => setNewPatient({ ...newPatient, breed: e.target.value })}
                    placeholder="e.g., Golden Retriever"
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                    placeholder="e.g., 5 years"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    value={newPatient.weight}
                    onChange={(e) => setNewPatient({ ...newPatient, weight: e.target.value })}
                    placeholder="e.g., 52 lbs"
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={newPatient.color}
                    onChange={(e) => setNewPatient({ ...newPatient, color: e.target.value })}
                    placeholder="e.g., Golden"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="microchip">Microchip ID</Label>
                <Input
                  id="microchip"
                  value={newPatient.microchip}
                  onChange={(e) => setNewPatient({ ...newPatient, microchip: e.target.value })}
                  placeholder="15-digit microchip number"
                />
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">Owner Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="owner-name">Owner Name</Label>
                    <Input
                      id="owner-name"
                      value={newPatient.owner.name}
                      onChange={(e) =>
                        setNewPatient({ ...newPatient, owner: { ...newPatient.owner, name: e.target.value } })
                      }
                      placeholder="e.g., John Smith"
                    />
                  </div>
                  <div>
                    <Label htmlFor="owner-phone">Phone</Label>
                    <Input
                      id="owner-phone"
                      value={newPatient.owner.phone}
                      onChange={(e) =>
                        setNewPatient({ ...newPatient, owner: { ...newPatient.owner, phone: e.target.value } })
                      }
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="owner-email">Email</Label>
                    <Input
                      id="owner-email"
                      type="email"
                      value={newPatient.owner.email}
                      onChange={(e) =>
                        setNewPatient({ ...newPatient, owner: { ...newPatient.owner, email: e.target.value } })
                      }
                      placeholder="owner@email.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="owner-address">Address</Label>
                  <Textarea
                    id="owner-address"
                    value={newPatient.owner.address}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, owner: { ...newPatient.owner, address: e.target.value } })
                    }
                    placeholder="123 Main St, City, State 12345"
                    className="h-20"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingPatient(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPatient} className="bg-primary hover:bg-primary/90">
                  Add Patient
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Patients ({filteredPatients.length})</CardTitle>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterSpecies} onValueChange={setFilterSpecies}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Species" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Species</SelectItem>
                      <SelectItem value="dog">Dogs</SelectItem>
                      <SelectItem value="cat">Cats</SelectItem>
                      <SelectItem value="bird">Birds</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`p-4 cursor-pointer border-l-4 hover:bg-muted/50 transition-colors ${
                      selectedPatient.id === patient.id ? "border-l-primary bg-muted/30" : "border-l-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm text-foreground">{patient.name}</h3>
                      <Badge variant={patient.status === "Active" ? "secondary" : "outline"} className="text-xs">
                        {patient.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Heart className="h-3 w-3" />
                        {patient.species} • {patient.breed}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        {patient.owner.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Last visit: {patient.lastVisit}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Details */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      {selectedPatient.name}
                    </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>
                      {selectedPatient.species} • {selectedPatient.breed}
                    </span>
                    <span>{selectedPatient.age}</span>
                    <span>{selectedPatient.weight}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditPatient(selectedPatient)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeletePatient(selectedPatient.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="medical">Medical History</TabsTrigger>
                  <TabsTrigger value="vaccines">Vaccines</TabsTrigger>
                  <TabsTrigger value="owner">Owner Info</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <h3 className="font-semibold">Patient Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Species:</span>
                          <span>{selectedPatient.species}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Breed:</span>
                          <span>{selectedPatient.breed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Age:</span>
                          <span>{selectedPatient.age}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Weight:</span>
                          <span>{selectedPatient.weight}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Color:</span>
                          <span>{selectedPatient.color}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Microchip:</span>
                          <span className="font-mono text-xs">{selectedPatient.microchip}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-semibold">Medical Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Allergies:</span>
                          <div className="mt-1">
                            {selectedPatient.allergies.map((allergy, index) => (
                              <Badge key={index} variant="outline" className="mr-1 mb-1 text-xs">
                                {allergy}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Current Medications:</span>
                          <div className="mt-1">
                            {selectedPatient.medications.map((medication, index) => (
                              <Badge key={index} variant="secondary" className="mr-1 mb-1 text-xs">
                                {medication}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Visit:</span>
                          <span>{selectedPatient.lastVisit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Next Appointment:</span>
                          <span>{selectedPatient.nextAppointment || "Not scheduled"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="medical" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Medical History</h3>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Record
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {selectedPatient.medicalHistory.map((record, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{record.type}</h4>
                              <p className="text-sm text-muted-foreground">
                                {record.date} • {record.veterinarian}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm">{record.notes}</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="vaccines" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Vaccination Records</h3>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Vaccine
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {selectedPatient.vaccinations.map((vaccine, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 border border-border rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium">{vaccine.vaccine}</h4>
                            <p className="text-sm text-muted-foreground">Given: {vaccine.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">Due: {vaccine.due}</p>
                            <Badge
                              variant={new Date(vaccine.due) < new Date() ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {new Date(vaccine.due) < new Date() ? "Overdue" : "Current"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="owner" className="mt-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Owner Information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{selectedPatient.owner.name}</p>
                            <p className="text-sm text-muted-foreground">Owner</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{selectedPatient.owner.phone}</p>
                            <p className="text-sm text-muted-foreground">Phone</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{selectedPatient.owner.email}</p>
                            <p className="text-sm text-muted-foreground">Email</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                          <div>
                            <p className="font-medium">{selectedPatient.owner.address}</p>
                            <p className="text-sm text-muted-foreground">Address</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-medium">Quick Actions</h4>
                        <div className="space-y-2">
                          <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                            <Phone className="h-4 w-4 mr-2" />
                            Call Owner
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Appointment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg">Select a patient to view details</p>
                  <p className="text-sm">Click on a patient from the list to see their information</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Patient Dialog */}
      <Dialog open={isEditingPatient} onOpenChange={setIsEditingPatient}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Patient: {editingPatient?.name}</DialogTitle>
          </DialogHeader>
          {editingPatient && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="edit-patient-name">Patient Name</Label>
                  <Input
                    id="edit-patient-name"
                    value={editingPatient.name}
                    onChange={(e) => setEditingPatient({ ...editingPatient, name: e.target.value })}
                    placeholder="e.g., Buddy"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-species">Species</Label>
                  <Select
                    value={editingPatient.species}
                    onValueChange={(value) => setEditingPatient({ ...editingPatient, species: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select species" />
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
                  <Label htmlFor="edit-breed">Breed</Label>
                  <Input
                    id="edit-breed"
                    value={editingPatient.breed}
                    onChange={(e) => setEditingPatient({ ...editingPatient, breed: e.target.value })}
                    placeholder="e.g., Golden Retriever"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-age">Age</Label>
                  <Input
                    id="edit-age"
                    value={editingPatient.age}
                    onChange={(e) => setEditingPatient({ ...editingPatient, age: e.target.value })}
                    placeholder="e.g., 5 years"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Owner Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="edit-owner-name">Owner Name</Label>
                    <Input
                      id="edit-owner-name"
                      value={editingPatient.owner.name}
                      onChange={(e) =>
                        setEditingPatient({ ...editingPatient, owner: { ...editingPatient.owner, name: e.target.value } })
                      }
                      placeholder="e.g., John Smith"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-owner-phone">Phone</Label>
                    <Input
                      id="edit-owner-phone"
                      value={editingPatient.owner.phone}
                      onChange={(e) =>
                        setEditingPatient({ ...editingPatient, owner: { ...editingPatient.owner, phone: e.target.value } })
                      }
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-owner-email">Email</Label>
                    <Input
                      id="edit-owner-email"
                      type="email"
                      value={editingPatient.owner.email}
                      onChange={(e) =>
                        setEditingPatient({ ...editingPatient, owner: { ...editingPatient.owner, email: e.target.value } })
                      }
                      placeholder="owner@email.com"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditingPatient(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} className="bg-primary hover:bg-primary/90">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
