"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CreatePetPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [species, setSpecies] = useState("")
  const [birthdate, setBirthdate] = useState("")
  const [chipNumber, setChipNumber] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    let photo_url = null

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

    const res = await fetch("/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, species, birthdate, chip_number: chipNumber, photo_url }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
    } else {
      router.push("/pets")
    }
  }

  return (
    <div>
      <h1>Add New Pet</h1>
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
          type="file"
          accept="image/jpeg,image/png"
          onChange={(e) => setPhoto(e.target.files?.[0] || null)}
        />
        {error && <p>{error}</p>}
        <button type="submit">Add Pet</button>
      </form>
    </div>
  )
}