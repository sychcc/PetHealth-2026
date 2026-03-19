"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function EditWeightPage({ params }: { params: Promise<{ id: string; weightId: string }> }) {
  const router = useRouter()
  const [id, setId] = useState("")
  const [petName, setPetName] = useState("")
  const [weightId, setWeightId] = useState("")
  const [weight, setWeight] = useState("")
  const [unit,setUnit]=useState("kg")
  const [date, setDate] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    params.then((w) => {
      setId(w.id)
      setWeightId(w.weightId)
    })
  }, [])
  useEffect(()=>{
    if(!id) return
    fetch(`/api/pets/${id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setPetName(data.name))
  },[id])

  useEffect(() => {
    if (!id || !weightId) return
    fetch(`/api/pets/${id}/weight`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const weight = data.find((w: any) => w.id === weightId)
        if (weight) {
          setWeight(weight.weight)
          setDate(weight.date.split("T")[0])
          setNotes(weight.notes||"")

        }
      })
  }, [id, weightId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    let weightInKg
    if(unit==='lbs'){
      weightInKg=parseFloat(weight)*0.453592
    }else{
      weightInKg=parseFloat(weight)
    }

    const res = await fetch(`/api/pets/${id}/weight/${weightId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight,date,notes }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error)
    } else {
      router.push(`/pets/${id}/weight`)
    }
  }

  return (
    <>
    {/*麵包屑 */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          marginBottom: "16px",
          fontSize: "14px",
          color: "#9ca3af",
        }}
      >
        <Link href="/pets" style={{ color: "#9ca3af", textDecoration: "none" }}>
          My Pets
        </Link>
        <span>›</span>
        <Link
          href={`/pets/${id}`}
          style={{ color: "#9ca3af", textDecoration: "none" }}
        >
          {petName}
        </Link>
        <span>›</span>
        <Link
          href={`/pets/${id}/weight`}
          style={{ color: "#9ca3af", textDecoration: "none" }}
        >
          Weight
        </Link>
        <span>›</span>
        <span style={{ color: "#f3f4f6" }}>Edit</span>
      </div>
    <div style={{ padding: "24px", maxWidth: "400px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px" }}>Edit Weight Record</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <label style={{ color: "#9ca3af", fontSize: "14px" }}>輸入體重 ＊</label>
        <div style={{ display: "flex", gap: "8px" }}>
          <input style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #374151", background: "#1f2937", color: "white" }} type="number" placeholder="weight" value={weight} onChange={(e) => setWeight(e.target.value)} />
          <select value={unit} onChange={(e)=>setUnit(e.target.value)} style={{padding: "8px", borderRadius: "6px", border: "1px solid #374151", background: "#1f2937", color: "white"}}>
            <option value="kg">kg</option>
            <option value="lbs">lbs</option>
          </select>
        </div>
        
        
        <label style={{ color: "#9ca3af", fontSize: "14px" }}>測量時間 ＊</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #374151", background: "#1f2937", color: "white" }} />
        <label style={{ color: "#9ca3af", fontSize: "14px" }}>備註</label>
        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #374151", background: "#1f2937", color: "white" }} />
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}
         <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <Link href={`/pets/${id}/weight`} style={{ flex: 1, background: "#1f2937", color: "white", padding: "10px", borderRadius: "6px", border: "1px solid #374151", cursor: "pointer", textDecoration: "none", textAlign: "center", fontSize: "14px" }}>
            Cancel
          </Link>
          <button type="submit" style={{ flex: 1, background: "#4b5563", color: "white", padding: "10px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "14px" }}>
            Save
          </button>
        </div>
      </form>
    </div>
    </>
  )
}
