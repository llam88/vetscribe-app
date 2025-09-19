import { NextRequest, NextResponse } from 'next/server'

const PIMS_SYSTEMS = [
  "Demo Mode (Simulation)",
  "ezyVet (Cloud-based)",
  "Cornerstone (AVImark)", 
  "ImproMed Infinity",
  "VetBlue",
  "Pulse Veterinary",
  "Vetspire"
]

export async function POST(req: NextRequest) {
  try {
    const { appointmentData, pimsSystem } = await req.json()

    if (!appointmentData || !pimsSystem) {
      return NextResponse.json({ error: 'Missing appointment data or PIMS system' }, { status: 400 })
    }

    // Simulate PIMS integration steps
    const integrationSteps = [
      { step: "Connecting to PIMS", progress: 20, delay: 500 },
      { step: "Uploading SOAP note", progress: 40, delay: 800 },
      { step: "Updating patient record", progress: 60, delay: 600 },
      { step: "Creating billing codes", progress: 80, delay: 700 },
      { step: "Scheduling follow-up", progress: 90, delay: 400 },
      { step: "Sending notifications", progress: 100, delay: 300 }
    ]

    // Generate realistic integration results
    const integrationResults = {
      success: true,
      pimsSystem,
      patientName: appointmentData.patient_name,
      integrationTime: "2.3 sec",
      results: {
        recordsUpdated: 3,
        billingGenerated: "$185.00",
        followUpScheduled: "1 week",
        notificationsSent: 2
      },
      billingCodes: {
        "99213": "Office Visit - Established Patient",
        "87081": "Culture, Presumptive",
        "99000": "Specimen Handling"
      },
      exportData: {
        patient_info: {
          name: appointmentData.patient_name || 'N/A',
          species: appointmentData.species || 'N/A',
          client: appointmentData.owner_name || 'N/A'
        },
        appointment: {
          date: appointmentData.appointment_date || new Date().toISOString().split('T')[0],
          type: appointmentData.appointment_type || 'N/A',
          soap_note: appointmentData.soap_note ? 
            appointmentData.soap_note.substring(0, 200) + "..." : "N/A"
        },
        follow_up: "Recheck in 1 week",
        client_communication: "Email summary sent"
      },
      steps: integrationSteps
    }

    // Add realistic delay to simulate actual PIMS connection
    await new Promise(resolve => setTimeout(resolve, 2000))

    return NextResponse.json({
      success: true,
      message: `Successfully integrated with ${pimsSystem}`,
      data: integrationResults
    })

  } catch (error) {
    console.error('PIMS integration error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'PIMS integration failed',
        message: 'PIMS integration disabled due to error - core functionality unaffected'
      },
      { status: 500 }
    )
  }
}
