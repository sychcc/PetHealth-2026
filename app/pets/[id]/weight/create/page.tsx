"use client";

import { useEffect, useState } from "react";
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

export default function CreateWeightPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [petName, setPetName] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("kg");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, []);
  useEffect(() => {
    if (!id) return;
    fetch(`/api/pets/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setPetName(d.name));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const weightInKg =
      unit === "lbs" ? parseFloat(weight) * 0.453592 : parseFloat(weight);
    const res = await fetch(`/api/pets/${id}/weight`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight: weightInKg, date, notes }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
    } else {
      router.push(`/pets/${id}/weight`);
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
        <Link
          href={`/pets/${id}`}
          style={{ color: "#4a6968", textDecoration: "none" }}
        >
          {petName}
        </Link>
        <span style={{ color: "#e4eaeb" }}>›</span>
        <Link
          href={`/pets/${id}/weight`}
          style={{ color: "#4a6968", textDecoration: "none" }}
        >
          Weight
        </Link>
        <span style={{ color: "#e4eaeb" }}>›</span>
        <span style={{ color: "#2d4a49", fontWeight: 500 }}>Add</span>
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
          Add Weight Record
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
              <label style={labelStyle}>Weight *</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="number"
                  placeholder="e.g. 5.9"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
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
              <label style={labelStyle}>Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Notes</label>
              <input
                type="text"
                placeholder="Optional"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={inputStyle}
              />
            </div>
            {error && (
              <p style={{ color: "#c0392b", fontSize: "13px", margin: 0 }}>
                {error}
              </p>
            )}
            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <Link
                href={`/pets/${id}/weight`}
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
                Add Weight
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
