"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Pet = {
  id: string
  name: string
  species: string
  birthdate: string
  photo_url: string | null
}

export default function PetsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pets, setPets] = useState<Pet[]>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status])

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/pets", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => setPets(data))
    }
  }, [status])

  if (status === "loading") return <p>loading...</p>

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>My Pets</h1>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/" style={{ background: "#1f2937", color: "white", padding: "8px 16px", borderRadius: "6px", textDecoration: "none" }}>Home</Link>
          <Link href="/pets/create" style={{ background: "#4b5563", color: "white", padding: "8px 16px", borderRadius: "6px", textDecoration: "none" }}>+ Add New Pet</Link>
        </div>
      </div>
      {pets.length === 0 ? (
        <p style={{ color: "#9ca3af" }}>No pets yet, go add one!</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {pets.map((pet) => (
            <Link key={pet.id} href={`/pets/${pet.id}`} style={{ textDecoration: "none", color: "inherit", background: "#1f2937", borderRadius: "8px", overflow: "hidden", width: "180px" }}>
              {pet.photo_url ? (
                <img src={pet.photo_url} alt={pet.name} style={{ width: "180px", height: "180px", objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ width: "180px", height: "180px", background: "#374151", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>No Photo</div>
              )}
              <div style={{ padding: "8px" }}>
                <p style={{ fontWeight: "bold", margin: 0 }}>{pet.name}</p>
                <p style={{ color: "#9ca3af", fontSize: "14px", margin: 0 }}>{pet.species}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}