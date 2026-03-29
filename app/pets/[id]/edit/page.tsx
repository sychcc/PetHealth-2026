"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Pet = {
  id: string;
  name: string;
  species: string;
  gender: string | null;
  breed: string | null;
  birthdate: string;
  chip_number: string | null;
  target_weight: number | null;
  photo_url: string | null;
};

const css = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:ital,wght@0,300;0,600;1,600&display=swap');
input, select { outline: none; }
input:focus, select:focus { border-color: #0E7C86 !important; }
`;

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1.5px solid #e4eaeb",
  background: "white",
  fontSize: "14px",
  color: "#0f2423",
  fontFamily: "DM Sans, sans-serif",
  boxSizing: "border-box" as const,
};
const labelStyle = {
  fontSize: "13px",
  fontWeight: 500,
  color: "#4a6968",
  marginBottom: "4px",
  display: "block" as const,
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
  const [gender, setGender] = useState("");
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
      .then((r) => r.json())
      .then((data: Pet) => {
        setName(data.name);
        setSpecies(data.species);
        setBreed(data.breed || "");
        setGender(data.gender || "");
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
    const weightInKg =
      unit === "lbs" ? parseFloat(tWeight) * 0.453592 : parseFloat(tWeight);
    const res = await fetch(`/api/pets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        species,
        breed,
        gender,
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
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#F1F4F4",
        minHeight: "100vh",
      }}
    >
      <style>{css}</style>

      {/* BREADCRUMB */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid #e4eaeb",
          padding: "0 32px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "13px",
          color: "#4a6968",
        }}
      >
        <Link href="/pets" style={{ color: "#4a6968", textDecoration: "none" }}>
          My Pets
        </Link>
        <span style={{ color: "#e4eaeb" }}>›</span>
        <Link
          href={`/pets/${id}`}
          style={{ color: "#4a6968", textDecoration: "none" }}
        >
          {name}
        </Link>
        <span style={{ color: "#e4eaeb" }}>›</span>
        <span style={{ color: "#2d4a49", fontWeight: 500 }}>Edit</span>
      </div>

      <div
        style={{ maxWidth: "560px", margin: "0 auto", padding: "32px 24px" }}
      >
        <div
          style={{
            fontFamily: "Fraunces, serif",
            fontSize: "28px",
            fontWeight: 600,
            color: "#0f2423",
            marginBottom: "24px",
          }}
        >
          Edit Pet
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "16px",
            border: "1px solid #e4eaeb",
            padding: "28px",
          }}
        >
          {/* 現有照片 */}
          {currentPhotoUrl && (
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Current Photo</label>
              <img
                src={currentPhotoUrl}
                alt="current"
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  border: "1px solid #e4eaeb",
                }}
              />
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label style={labelStyle}>Pet Name *</label>
              <input
                type="text"
                placeholder="e.g. Money"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div>
                <label style={labelStyle}>Species *</label>
                <select
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select</option>
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Breed</label>
              <input
                type="text"
                placeholder="e.g. Jack Russell"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Birthday *</label>
              <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Chip Number</label>
              <input
                type="text"
                placeholder="Optional"
                value={chipNumber}
                onChange={(e) => setChipNumber(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Target Weight</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="number"
                  placeholder="Optional"
                  value={tWeight}
                  onChange={(e) => setTweight(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  style={{ ...inputStyle, width: "80px" }}
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Update Photo</label>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                style={{ fontSize: "13px", color: "#4a6968" }}
              />
            </div>

            {error && (
              <p style={{ color: "#c0392b", fontSize: "13px", margin: 0 }}>
                {error}
              </p>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <Link
                href={`/pets/${id}`}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: "10px",
                  border: "1.5px solid #e4eaeb",
                  color: "#2d4a49",
                  textDecoration: "none",
                  textAlign: "center",
                  fontSize: "14px",
                  fontWeight: 500,
                  background: "transparent",
                }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: "10px",
                  background: "#0E7C86",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
