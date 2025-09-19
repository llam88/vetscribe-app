"use client"
import { useState } from "react"
import { createClientBrowser } from "@/lib/supabase-browser"
import { v4 as uuid } from "uuid"

type Patient = {
  id?: string
  name: string
  species?: string
  breed?: string
  sex?: string
  age?: string
  weight?: string
  owner?: string
  notes?: string
}

export default function PatientsForm() {
  const sb = createClientBrowser()
  const [p, setP] = useState<Patient>({ name: "" })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function save() {
    if (!p.name) return setErr("Name is required")
    setErr(null); setSaving(true)
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { setErr("Not signed in"); setSaving(false); return }

    const row = { id: uuid(), user_id: user.id, ...p }
    const { error } = await sb.from("patients").insert(row)
    if (error) setErr(error.message)
    else {
      setP({ name: "" })
      // Refresh the page to show updated data
      window.location.reload()
    }
    setSaving(false)
  }

  function field(name: keyof Patient, label?: string) {
    return (
      <div>
        <label className="block text-xs text-gray-600">{label || name}</label>
        <input
          className="border rounded p-2 w-full"
          value={(p[name] as any) || ""}
          onChange={e => setP(s => ({ ...s, [name]: e.target.value }))}
          placeholder={label || name}
        />
      </div>
    )
  }

  return (
    <div className="p-4 border rounded space-y-3">
      <h3 className="font-semibold">New Patient</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {field("name", "Name *")}
        {field("owner", "Owner")}
        {field("species", "Species")}
        {field("breed", "Breed")}
        {field("sex", "Sex")}
        {field("age", "Age")}
        {field("weight", "Weight")}
      </div>
      <div>
        <label className="block text-xs text-gray-600">Notes</label>
        <textarea className="border rounded p-2 w-full min-h-[90px]" value={p.notes || ""}
          onChange={e => setP(s => ({ ...s, notes: e.target.value }))} />
      </div>
      <div className="flex gap-2 items-center">
        <button className="px-3 py-2 rounded bg-black text-white disabled:opacity-50" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save patient"}
        </button>
        {err && <span className="text-red-600 text-sm">{err}</span>}
      </div>
    </div>
  )
}
