import { redirect } from "next/navigation"
import { createClientServer } from "@/lib/supabase-server"
import TemplatesPicker from "@/components/TemplatesPicker"

export default async function TemplatesPage() {
  const sb = await createClientServer()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect("/sign-in")

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Templates</h1>
      <p className="text-gray-600 text-sm">Pick a default template on the Record page; this page just previews your options.</p>
      <TemplatesPicker onChange={() => {}} />
    </div>
  )
}
