"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Medical = {
      id:string,
      brief_name:string,
      date: string,
      clinic:string|null,
      symptoms:string|null,
      diagnosis:string|null,
      prescription:string|null,
      cost:number|null,
      photo_url:string|null,
}

export default function MedicalPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [id, setId] = useState("")
  const [medicals, setMedicals] = useState<Medical[]>([])
  const [petName,setPetName]=useState("")

  useEffect(() => {
    params.then((p) => setId(p.id))
  }, [])

  useEffect(() => {
    if (!id) return
    fetch(`/api/pets/${id}/medical`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setMedicals(data))
      fetch(`/api/pets/${id}`,{ credentials: "include" })
      .then((res) => res.json())
      .then((data)=>setPetName(data.name))
  }, [id])

  async function handleDelete(medicalId: string) {
    if (!confirm("確定要刪除這筆醫療記錄嗎？")) return
    const res = await fetch(`/api/pets/${id}/medical/${medicalId}`, {
      method: "DELETE",
      credentials: "include",
    })
    if (res.ok) {
      setMedicals(medicals.filter((m) => m.id !== medicalId))
    }
  }

  return (
    <div style={{ padding: "24px", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Medical Records</h1>
        <Link href={`/pets/${id}/medical/create`} style={{ background: "#4b5563", color: "white", padding: "8px 16px", borderRadius: "6px", textDecoration: "none" }}>
           + Add A Medical Record
        </Link>
      </div>
      {medicals.length === 0 ? (
        <p style={{ color: "#9ca3af" }}>No medical records yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {medicals.map((m) => (
            <div key={m.id} style={{ background: "#1f2937", padding: "16px", borderRadius: "8px" }}>
              <p style={{ fontWeight: "bold", fontSize: "16px" }}>{m.brief_name}</p>
              {m.clinic && <p style={{ color: "#9ca3af", fontSize: "14px" }}>Clinic: {m.clinic}</p>}
              {m.symptoms && <p style={{ color: "#9ca3af", fontSize: "14px" }}>Symptom: {m.symptoms}</p>}
              {m.diagnosis && <p style={{ color: "#9ca3af", fontSize: "14px" }}>Diagnosis: {m.diagnosis}</p>}
              {m.prescription && <p style={{ color: "#9ca3af", fontSize: "14px" }}>Prescription: {m.prescription}</p>}
              {m.cost && <p style={{ color: "#9ca3af", fontSize: "14px" }}>Cost: {m.cost}元</p>}
              {m.photo_url && (
              <img src={m.photo_url} alt="medical record" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "6px", marginTop: "8px" }} />
)}
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <Link href={`/pets/${id}/medical/${m.id}/edit`} style={{ background: "#6b7280", color: "white", padding: "6px 12px", borderRadius: "6px", textDecoration: "none", fontSize: "14px" }}>Edit</Link>
<button onClick={() => handleDelete(m.id)} style={{ background: "#374151", color: "white", padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "14px" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: "24px" }}>
        <Link href={`/pets/${id}`} style={{ color: "#9ca3af" }}>Back to {petName}'s page</Link>
      </div>
    </div>
  )
}