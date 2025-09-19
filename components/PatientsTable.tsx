"use client"
import { useEffect, useState } from "react"
import { createClientBrowser } from "@/lib/supabase-browser"

type Patient = {
  id: string
  name: string
  owner?: string
  species?: string
  breed?: string
  sex?: string
  age?: string
  weight?: string
  notes?: string
}

export default function PatientsTable() {
  const sb = createClientBrowser()
  const [rows, setRows] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  async function load() {
    setLoading(true); setErr(null)
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { setErr("Not signed in"); setLoading(false); return }
    const { data, error } = await sb.from("patients").select("*").order("created_at", { ascending: false })
    if (error) setErr(error.message)
    else setRows(data as any || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function del(id: string) {
    await sb.from("patients").delete().eq("id", id)
    load()
  }

  if (loading) return <p>Loading patients…</p>
  if (err) return <p className="text-red-600">Error: {err}</p>
  if (!rows.length) return <p>No patients yet.</p>

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Name</th>
            <th className="p-2">Owner</th>
            <th className="p-2">Species</th>
            <th className="p-2">Breed</th>
            <th className="p-2">Sex</th>
            <th className="p-2">Age</th>
            <th className="p-2">Weight</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className="border-b">
              <td className="p-2">{r.name}</td>
              <td className="p-2">{r.owner || "-"}</td>
              <td className="p-2">{r.species || "-"}</td>
              <td className="p-2">{r.breed || "-"}</td>
              <td className="p-2">{r.sex || "-"}</td>
              <td className="p-2">{r.age || "-"}</td>
              <td className="p-2">{r.weight || "-"}</td>
              <td className="p-2 text-right">
                <div className="flex gap-2 justify-end">
                  <a 
                    href={`/patients/${r.id}`}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    View Profile
                  </a>
                  <button className="text-red-600 text-sm hover:underline" onClick={() => del(r.id)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
