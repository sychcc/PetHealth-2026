"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Pet = {
  id: string
  name: string
  species: string
  birthdate: string
  chip_number: string | null
  photo_url: string | null
}

export default function PetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [pet, setPet] = useState<Pet | null>(null)
  const [error, setError] = useState("")
  const [id, setId] = useState<string>("")

  useEffect(() => {
    params.then((p) => setId(p.id))
  }, [])

  useEffect(() => {
    if (!id) return
    fetch(`/api/pets/${id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setPet(data)
        }
      })
  }, [id])

  async function handleDelete() {
    if (!confirm("確定要刪除這隻寵物嗎？")) return
    const res = await fetch(`/api/pets/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
    if (res.ok) {
      router.push("/pets")
    }
  }

  if (error) return <p>{error}</p>
  if (!pet) return <p>Loading...</p>

  return (
  <div style={{ padding: "24px", maxWidth: "600px", margin: "0 auto" }}>
    <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>{pet.name}</h1>
    {pet.photo_url && (
      <img src={pet.photo_url} alt={pet.name} style={{ width: "200px", height: "200px", objectFit: "cover", borderRadius: "8px", marginBottom: "16px" }} />
    )}
    <p>Species: {pet.species}</p>
    <p>Birthday: {new Date(pet.birthdate).toLocaleDateString()}</p>
    {pet.chip_number && <p>Chip Number: {pet.chip_number}</p>}
    <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
  <Link href={`/pets/${id}/vaccines`} style={{ background: "#4b5563", color: "white", padding: "8px 16px", borderRadius: "6px", textDecoration: "none" }}>Vaccine Records</Link>
  <Link href={`/pets/${id}/edit`} style={{ background: "#6b7280", color: "white", padding: "8px 16px", borderRadius: "6px", textDecoration: "none" }}>Edit</Link>
  <button onClick={handleDelete} style={{ background: "#374151", color: "white", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer" }}>Delete</button>
  <Link href="/pets" style={{ background: "#1f2937", color: "white", padding: "8px 16px", borderRadius: "6px", textDecoration: "none" }}>Back</Link>
</div>
  </div>
)
}