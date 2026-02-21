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
    <div>
      <h1>My Pets</h1>
      <Link href="/pets/create">Add new pets</Link>
      {pets.length === 0 ? (
        <p>No pets yet, go add one!</p>
      ) : (
        <ul>
          {pets.map((pet) => (
  <li key={pet.id}>
    {pet.photo_url && (
      <img
        src={pet.photo_url}
        alt={pet.name}
        width={100}
        height={100}
        style={{ objectFit: "cover" }}
      />
    )}
    <Link href={`/pets/${pet.id}`}>{pet.name}</Link>
    <span>（{pet.species}）</span>
  </li>
))}
        </ul>
      )}
    </div>
  )
}