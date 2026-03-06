"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Pet = {
  id: string
  name: string
  species: string
  birthdate: string
  chip_number: string | null
  target_weight:number|null
  photo_url: string | null
}

export default function EditPetPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [id, setId] = useState<string>("")
  const [name, setName] = useState("")
  const [species, setSpecies] = useState("")
  const [birthdate, setBirthdate] = useState("")
  const [chipNumber, setChipNumber] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null)
  const [tWeight, setTweight] = useState("")
  const [unit,setUnit]=useState("kg")
  const [error, setError] = useState("")

  useEffect(() => {
    params.then((p) => setId(p.id))
  }, [])

  useEffect(() => {
    if (!id) return
    fetch(`/api/pets/${id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data: Pet) => {
        setName(data.name)
        setSpecies(data.species)
        setBirthdate(data.birthdate.split("T")[0])
        setChipNumber(data.chip_number || "")
        setCurrentPhotoUrl(data.photo_url)
        setTweight(data.target_weight?String(data.target_weight):"")
      })
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    let photo_url = currentPhotoUrl

    if (photo) {
      const formData = new FormData()
      formData.append("file", photo)
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) {
        setError(uploadData.error)
        return
      }
      photo_url = uploadData.url
    }

    let weightInKg
    if(unit==='lbs'){
      weightInKg=parseFloat(tWeight)*0.453592
    }else{
      weightInKg=parseFloat(tWeight)
    }

    const res = await fetch(`/api/pets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, species, birthdate, chip_number: chipNumber, photo_url,target_weight:tWeight?weightInKg:null }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
    } else {
      router.push(`/pets/${id}`)
    }
  }

  return (
    <div>
      <h1>Edit Pet Page</h1>
      {currentPhotoUrl && (
        <img src={currentPhotoUrl} alt="current photo" width={100} height={100} style={{ objectFit: "cover" }} />
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Pet name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Species"
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
        />
        <input
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Chip number (optional)"
          value={chipNumber}
          onChange={(e) => setChipNumber(e.target.value)}
        />
         <input
          type="number"
          placeholder="Target weight (optional)"
          value={tWeight}
          onChange={(e) => setTweight(e.target.value)}
        />
        <select value={unit} onChange={(e)=>setUnit(e.target.value)} style={{padding: "8px", borderRadius: "6px", border: "1px solid #374151", background: "#1f2937", color: "white"}}>
            <option value="kg">kg</option>
            <option value="lbs">lbs</option>
          </select>
        <input
          type="file"
          accept="image/jpeg,image/png"
          onChange={(e) => setPhoto(e.target.files?.[0] || null)}
        />
        {error && <p>{error}</p>}
        <button type="submit" style={{ background: "#4b5563", color: "white", padding: "10px", borderRadius: "6px", border: "none", cursor: "pointer" }}>Save</button>
      </form>
    </div>
  )
}