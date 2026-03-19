"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  birthdate: string;
  chip_number: string | null;
  target_weight: number | null;
  photo_url: string | null;
};

export default function EditPetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [chipNumber, setChipNumber] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [tWeight, setTweight] = useState("");
  const [unit, setUnit] = useState("kg");
  const [error, setError] = useState("");

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/pets/${id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data: Pet) => {
        setName(data.name);
        setSpecies(data.species);
        setBreed(data.breed||"");
        setBirthdate(data.birthdate.split("T")[0]);
        setChipNumber(data.chip_number || "");
        setCurrentPhotoUrl(data.photo_url);
        setTweight(data.target_weight ? String(data.target_weight) : "");
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let photo_url = currentPhotoUrl;

    if (photo) {
      const formData = new FormData();
      formData.append("file", photo);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setError(uploadData.error);
        return;
      }
      photo_url = uploadData.url;
    }

    let weightInKg;
    if (unit === "lbs") {
      weightInKg = parseFloat(tWeight) * 0.453592;
    } else {
      weightInKg = parseFloat(tWeight);
    }

    const res = await fetch(`/api/pets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        species,
        breed,
        birthdate,
        chip_number: chipNumber,
        photo_url,
        target_weight: tWeight ? weightInKg : null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
    } else {
      router.push(`/pets/${id}`);
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
          {name}
        </Link>
        <span>›</span>
        <span style={{ color: "#f3f4f6" }}>Edit</span>
      </div>
      <div
        style={{ maxWidth: "400px", margin: "40px auto", padding: "0 24px" }}
      >
        <h1
          style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "24px" }}
        >
          Edit Pet
        </h1>

        {currentPhotoUrl && (
          <img
            src={currentPhotoUrl}
            alt="current photo"
            style={{
              width: "100px",
              height: "100px",
              objectFit: "cover",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          />
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <input
            type="text"
            placeholder="Pet name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #374151",
              background: "#1f2937",
              color: "white",
              fontSize: "14px",
            }}
          />
          <select value={species} onChange={(e)=>setSpecies(e.target.value)} style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #374151", background: "#1f2937", color: "white", fontSize: "14px" }}>
            <option value="">Select species</option>
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Other">Other</option>
          </select>
          <input type="text" placeholder="Breed(Optional)" value={breed} onChange={(e)=>setBreed(e.target.value)} style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #374151",
              background: "#1f2937",
              color: "white",
              fontSize: "14px",
            }} />
          <input
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #374151",
              background: "#1f2937",
              color: "white",
              fontSize: "14px",
            }}
          />
          <input
            type="text"
            placeholder="Chip number (optional)"
            value={chipNumber}
            onChange={(e) => setChipNumber(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #374151",
              background: "#1f2937",
              color: "white",
              fontSize: "14px",
            }}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="number"
              placeholder="Target weight (optional)"
              value={tWeight}
              onChange={(e) => setTweight(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #374151",
                background: "#1f2937",
                color: "white",
                fontSize: "14px",
              }}
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #374151",
                background: "#1f2937",
                color: "white",
                fontSize: "14px",
              }}
            >
              <option value="kg">kg</option>
              <option value="lbs">lbs</option>
            </select>
          </div>

          <label style={{ color: "#9ca3af", fontSize: "13px" }}>
            更換照片（選填）
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            style={{ color: "#9ca3af", fontSize: "14px" }}
          />

          {error && (
            <p style={{ color: "#ef4444", fontSize: "14px", margin: 0 }}>
              {error}
            </p>
          )}

          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <Link
              href={`/pets/${id}`}
              style={{
                flex: 1,
                background: "#1f2937",
                color: "white",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #374151",
                cursor: "pointer",
                textDecoration: "none",
                textAlign: "center",
                fontSize: "14px",
              }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              style={{
                flex: 1,
                background: "#4b5563",
                color: "white",
                padding: "10px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
