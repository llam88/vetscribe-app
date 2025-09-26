"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SMSComposer } from "@/components/sms-composer"
import { Smartphone, Mail, MessageSquare } from "lucide-react"
import { ClientCommunicationHubEnhanced } from "@/components/client-communication-hub-enhanced"

interface SMSCommunicationTabProps {
  appointments: any[]
}

export function SMSCommunicationTab({ appointments }: SMSCommunicationTabProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)

  // Filter appointments that have phone numbers
  const appointmentsWithPhone = appointments.filter(apt => apt.owner_phone)
  const appointmentsWithoutPhone = appointments.filter(apt => !apt.owner_phone)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Patient Communication
          </h1>
          <p className="text-muted-foreground">Send emails and SMS updates to pet owners</p>
        </div>
      </div>

      <Tabs defaultValue="sms" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            SMS Messages
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Communications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sms" className="space-y-6">
          {/* SMS Composer */}
          {selectedAppointment ? (
            <SMSComposer
              patientName={selectedAppointment.patient_name}
              ownerName={selectedAppointment.owner_name}
              ownerPhone={selectedAppointment.owner_phone}
              visitType={selectedAppointment.appointment_type}
              visitDate={selectedAppointment.appointment_date}
              soapNotes={selectedAppointment.soap_note}
              onSend={(phone, message) => {
                console.log('SMS sent:', { phone, message })
                setSelectedAppointment(null) // Reset after sending
              }}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Select an Appointment for SMS</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose an appointment to send SMS updates to the pet owner
                </p>
              </CardHeader>
            </Card>
          )}

          {/* Appointments with Phone Numbers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-green-600" />
                Ready for SMS ({appointmentsWithPhone.length})
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Appointments with owner phone numbers
              </p>
            </CardHeader>
            <CardContent>
              {appointmentsWithPhone.length > 0 ? (
                <div className="space-y-3">
                  {appointmentsWithPhone.map((appointment) => (
                    <div 
                      key={appointment.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      <div>
                        <p className="font-medium">{appointment.patient_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Owner: {appointment.owner_name} • {appointment.owner_phone}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.appointment_type} • {appointment.appointment_date}
                        </p>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <Smartphone className="h-4 w-4 mr-2" />
                        Send SMS
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Smartphone className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No appointments with phone numbers yet</p>
                  <p className="text-sm">Add phone numbers when creating appointments</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appointments Missing Phone Numbers */}
          {appointmentsWithoutPhone.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-orange-500" />
                  Missing Phone Numbers ({appointmentsWithoutPhone.length})
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Add phone numbers to enable SMS communication
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {appointmentsWithoutPhone.slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{appointment.patient_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Owner: {appointment.owner_name} • No phone number
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Add Phone Number
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="email">
          <ClientCommunicationHubEnhanced appointments={appointments} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
