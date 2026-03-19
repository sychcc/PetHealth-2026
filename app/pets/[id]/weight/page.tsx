"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Weight = {
  id: string;
  weight: number;
  date: string;
  notes: string | null;
};

export default function weightPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [weights, setWeights] = useState<Weight[]>([]);
  const [petName, setPetName] = useState("");

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/pets/${id}/weight`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setWeights(data));
    fetch(`/api/pets/${id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setPetName(data.name));
  }, [id]);

  async function handleDelete(weightId: string) {
    if (!confirm("確定要刪除這筆體重記錄嗎？")) return;
    const res = await fetch(`/api/pets/${id}/weight/${weightId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      setWeights(weights.filter((w) => w.id !== weightId));
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
          {petName}
        </Link>
        <span>›</span>
        <span style={{ color: "#f3f4f6" }}>Weight</span>
      </div>
    <div style={{ padding: "24px", maxWidth: "600px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Weight Records</h1>
        <Link
          href={`/pets/${id}/weight/create`}
          style={{
            background: "#4b5563",
            color: "white",
            padding: "8px 16px",
            borderRadius: "6px",
            textDecoration: "none",
          }}
        >
          + Add Weight
        </Link>
      </div>
      {weights.length === 0 ? (
        <p style={{ color: "#9ca3af" }}>No weight records yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {weights.map((w) => (
            <div
              key={w.id}
              style={{
                background: "#1f2937",
                padding: "16px",
                borderRadius: "8px",
              }}
            >
              <p style={{ fontWeight: "bold", fontSize: "16px" }}>
                Weight: {w.weight} kgs
              </p>
              <p style={{ fontWeight: "bold", fontSize: "16px" }}>
                Notes: {w.notes}
              </p>
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <Link
                  href={`/pets/${id}/weight/${w.id}/edit`}
                  style={{
                    background: "#6b7280",
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(w.id)}
                  style={{
                    background: "#374151",
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
