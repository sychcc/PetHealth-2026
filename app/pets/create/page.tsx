
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export default function CreatePetPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [chipNumber, setChipNumber] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let photo_url = null;
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
    const res = await fetch("/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        species,
        breed,
        gender,
        birthdate,
        chip_number: chipNumber,
        photo_url,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
    } else {
      router.push("/pets");
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
        <span style={{ color: "#2d4a49", fontWeight: 500 }}>Add New Pet</span>
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
          Add New Pet
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "16px",
            border: "1px solid #e4eaeb",
            padding: "28px",
          }}
        >
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
                  <option value="Unknown">Unknown</option>
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
              <label style={labelStyle}>Photo</label>
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
                href="/pets"
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
                Add Pet
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
