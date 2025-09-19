"use client"
import { useState } from "react"
import { TEMPLATES, NoteTemplate } from "@/data/templates"

export default function TemplatesPicker({ onChange }: { onChange: (t: NoteTemplate) => void }) {
  const [selected, setSelected] = useState<string>("soap")

  function pick(id: string) {
    const t = TEMPLATES.find(x => x.id === id)!
    setSelected(id)
    onChange(t)
  }

  return (
    <div className="grid sm:grid-cols-3 gap-3">
      {TEMPLATES.map(t => (
        <button
          key={t.id}
          onClick={() => pick(t.id)}
          className={`border rounded p-3 text-left ${selected === t.id ? "bg-gray-100 border-black" : ""}`}
        >
          <div className="font-semibold">{t.label}</div>
          <div className="text-xs text-gray-600">{t.description}</div>
        </button>
      ))}
    </div>
  )
}
