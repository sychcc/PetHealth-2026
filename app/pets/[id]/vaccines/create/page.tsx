"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function CreateVaccinePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [id, setId] = useState("")
  const [vaccineName, setVaccineName] = useState("")
  const [date, setDate] = useState("")
  const [nextDueDate, setNextDueDate] = useState("")
  const [clinic, setClinic] = useState("")
  const [vetName, setVetName] = useState("")
  const [cost, setCost] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    params.then((p) => setId(p.id))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    let photo_url = null
    if (photo) {
      const formData = new FormData()
      formData.append("file", photo)
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) { setError(uploadData.error); return }
      photo_url = uploadData.url
    }

    const res = await fetch(`/api/pets/${id}/vaccines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vaccine_name: vaccineName, date, next_due_date: nextDueDate || null, clinic, vet_name: vetName,cost:cost?parseInt(cost):null, photo_url }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error)
    } else {
      router.push(`/pets/${id}/vaccines`)
    }
  }

  return (
    <div style={{ padding: "24px", maxWidth: "400px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px" }}>Add Vaccine Record</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <label style={{ color: "#9ca3af", fontSize: "14px" }}>Vaccine Name *</label>
        <input type="text" placeholder="Vaccine name *" value={vaccineName} onChange={(e) => setVaccineName(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #374151", background: "#1f2937", color: "white" }} />
        <label style={{ color: "#9ca3af", fontSize: "14px" }}>Vaccination Date *</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #374151", background: "#1f2937", color: "white" }} />
        <label style={{ color: "#9ca3af", fontSize: "14px" }}>Next Due Date</label>
        <input type="date" min={new Date().toISOString().split('T')[0]} value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #374151", background: "#1f2937", color: "white" }} />
        <input type="text" placeholder="Clinic (optional)" value={clinic} onChange={(e) => setClinic(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #374151", background: "#1f2937", color: "white" }} />
        <input type="text" placeholder="Vet name (optional)" value={vetName} onChange={(e) => setVetName(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #374151", background: "#1f2937", color: "white" }} />
        <input type="number" placeholder="Cost (optional)" value={cost} step="1" min="0" onChange={(e) => setCost(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #374151", background: "#1f2937", color: "white" }} />
        <input type="file" accept="image/jpeg,image/png" onChange={(e) => setPhoto(e.target.files?.[0] || null)} style={{ color: "white" }} />
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}
        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <Link href={`/pets/${id}`} style={{ flex: 1, background: "#1f2937", color: "white", padding: "10px", borderRadius: "6px", border: "1px solid #374151", cursor: "pointer", textDecoration: "none", textAlign: "center", fontSize: "14px" }}>
            Cancel
          </Link>
          <button type="submit" style={{ flex: 1, background: "#4b5563", color: "white", padding: "10px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "14px" }}>
            Add Vaccine
          </button>
        </div>
        
      </form>
    </div>
  )
}