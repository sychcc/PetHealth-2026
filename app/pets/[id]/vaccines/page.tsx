"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Vaccine = {
  id: string
  vaccine_name: string
  date: string
  next_due_date: string | null
  clinic: string | null
  vet_name: string | null
  cost:number|null
  photo_url: string | null
}

export default function VaccinesPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [id, setId] = useState("")
  const [vaccines, setVaccines] = useState<Vaccine[]>([])
  const [petName,setPetName]=useState("")

  useEffect(() => {
    params.then((p) => setId(p.id))
  }, [])

  useEffect(() => {
    if (!id) return
    fetch(`/api/pets/${id}/vaccines`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setVaccines(data))
      fetch(`/api/pets/${id}`,{ credentials: "include" })
      .then((res) => res.json())
      .then((data)=>setPetName(data.name))
  }, [id])

  async function handleDelete(vaccineId: string) {
    if (!confirm("確定要刪除這筆疫苗記錄嗎？")) return
    const res = await fetch(`/api/pets/${id}/vaccines/${vaccineId}`, {
      method: "DELETE",
      credentials: "include",
    })
    if (res.ok) {
      setVaccines(vaccines.filter((v) => v.id !== vaccineId))
    }
  }

  function isDueSoon(next_due_date: string | null) {
  if (!next_due_date) return false
  const now = new Date().getTime()
  const due = new Date(next_due_date).getTime()
  const diff = due - now
  return diff > 0 && diff < 5 * 24 * 60 * 60 * 1000
}

function isExpired(next_due_date: string | null) {
  if (!next_due_date) return false
  return new Date(next_due_date).getTime() < new Date().getTime()
}

  return (
    <div style={{ padding: "24px", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Vaccine Records</h1>
        <Link href={`/pets/${id}/vaccines/create`} style={{ background: "#4b5563", color: "white", padding: "8px 16px", borderRadius: "6px", textDecoration: "none" }}>
           + Add Vaccine
        </Link>
      </div>
      {vaccines.length === 0 ? (
        <p style={{ color: "#9ca3af" }}>No vaccine records yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {vaccines.map((v) => (
            <div key={v.id} style={{ background: "#1f2937", padding: "16px", borderRadius: "8px" }}>
              <p style={{ fontWeight: "bold", fontSize: "16px" }}>{v.vaccine_name}</p>
              <p style={{ color: "#9ca3af", fontSize: "14px" }}>Date: {new Date(v.date).toLocaleDateString()}</p>
              {v.next_due_date && (
  <p style={{ color: isExpired(v.next_due_date) ? "#6b7280" : isDueSoon(v.next_due_date) ? "#ef4444" : "#9ca3af", fontSize: "14px" }}>
    Next Due: {new Date(v.next_due_date).toLocaleDateString()}
    {isExpired(v.next_due_date) && " Expired"}
    {isDueSoon(v.next_due_date) && " Due Soon!"}
  </p>
)}
              {v.clinic && <p style={{ color: "#9ca3af", fontSize: "14px" }}>Clinic: {v.clinic}</p>}
              {v.vet_name && <p style={{ color: "#9ca3af", fontSize: "14px" }}>Vet: {v.vet_name}</p>}
              {v.cost && <p style={{ color: "#9ca3af", fontSize: "14px" }}>Cost: NTD {v.cost}</p>}
              {v.photo_url && (
              <img src={v.photo_url} alt="vaccine record" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "6px", marginTop: "8px" }} />
)}
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <Link href={`/pets/${id}/vaccines/${v.id}/edit`} style={{ background: "#6b7280", color: "white", padding: "6px 12px", borderRadius: "6px", textDecoration: "none", fontSize: "14px" }}>Edit</Link>
<button onClick={() => handleDelete(v.id)} style={{ background: "#374151", color: "white", padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "14px" }}>Delete</button>
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