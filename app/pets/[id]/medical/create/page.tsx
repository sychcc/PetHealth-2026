"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function CreateMedicalPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [id, setId] = useState("")
  const [briefName, setBriefName] = useState("")
  const [date, setDate] = useState("")
  const [clinic,setClinic]=useState("")
  const [symptoms, setSymptoms] = useState("")
  const [diagnosis,setDiagnosis]=useState("")
  const [prescription,setPrescription]=useState("")
  const [cost,setCost]=useState("")
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

    const res = await fetch(`/api/pets/${id}/medical`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brief_name:briefName,date,clinic,symptoms,diagnosis,prescription,cost:cost?parseInt(cost):null,photo_url }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error)
    } else {
      router.push(`/pets/${id}/medical`)
    }
  }

  return (
    <div style={{ padding: "24px", maxWidth: "400px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px" }}>Add A Medical Record</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input type="text" placeholder="medical name *" value={briefName} onChange={(e) => setBriefName(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #374151", background: "#1f2937", color: "white" }} />
        <label style={{ color: "#9ca3af", fontSize: "14px" }}>Medial Date *</label>
        <input type="date" max={new Date().toISOString().split('T')[0]} value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #374151", background: "#1f2937", color: "white" }} />
        <input type="text" placeholder="Clinic (optional)" value={clinic} onChange={(e) => setClinic(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #374151", background: "#1f2937", color: "white" }} />
        <input type="text" placeholder="Symptom (optional)" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #374151", background: "#1f2937", color: "white" }} />
        <input type="text" placeholder="Diagnosis (optional)" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #374151", background: "#1f2937", color: "white" }} />
        <input type="text" placeholder="Prescription (optional)" value={prescription} onChange={(e) => setPrescription(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #374151", background: "#1f2937", color: "white" }} />
        <input type="number" placeholder="Cost (optional)" value={cost} step="1"min="0" onChange={(e) => setCost(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #374151", background: "#1f2937", color: "white" }} />
        <input type="file" accept="image/jpeg,image/png" onChange={(e) => setPhoto(e.target.files?.[0] || null)} style={{ color: "white" }} />
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}
        <button type="submit" style={{ background: "#4b5563", color: "white", padding: "10px", borderRadius: "6px", border: "none", cursor: "pointer" }}>Add Medical</button>
      </form>
    </div>
  )
}