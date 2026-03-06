"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function CreateWeightPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [id, setId] = useState("")
  const [weight, setWeight] = useState("")
  const [unit,setUnit]=useState("kg")
  const [date, setDate] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    params.then((p) => setId(p.id))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    let weightInKg
    if(unit==='lbs'){
      weightInKg=parseFloat(weight)*0.453592
    }else{
      weightInKg=parseFloat(weight)
    }


    const res = await fetch(`/api/pets/${id}/weight`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight:weightInKg, date, notes }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error)
    } else {
      router.push(`/pets/${id}/weight`)
    }
  }

  return (
    <div style={{ padding: "24px", maxWidth: "400px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px" }}>Add Weight Record</h1>
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
        <button type="submit" style={{ background: "#4b5563", color: "white", padding: "10px", borderRadius: "6px", border: "none", cursor: "pointer" }}>Add Weight</button>
      </form>
    </div>
  )
}