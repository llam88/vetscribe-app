export type NoteTemplate = {
  id: string
  label: string
  description: string
  skeleton: string
}

export const TEMPLATES: NoteTemplate[] = [
  {
    id: "soap",
    label: "SOAP",
    description: "Standard Subjective/Objective/Assessment/Plan",
    skeleton: "SUBJECTIVE:\n\nOBJECTIVE:\n\nASSESSMENT:\n\nPLAN:\n"
  },
  {
    id: "dap",
    label: "DAP",
    description: "Data/Assessment/Plan alternative",
    skeleton: "DATA:\n\nASSESSMENT:\n\nPLAN:\n"
  },
  {
    id: "discharge",
    label: "Discharge Summary",
    description: "Client-facing summary for sending home",
    skeleton: "SUMMARY:\n\nINSTRUCTIONS:\n\nMEDICATIONS:\n\nFOLLOW-UP:\n"
  }
]
