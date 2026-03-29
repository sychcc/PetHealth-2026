"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Weight = {
  id: string;
  weight: number;
  date: string;
  notes: string | null;
};

const css = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:ital,wght@0,300;0,600;1,600&display=swap');`;

export default function WeightPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState("");
  const [weights, setWeights] = useState<Weight[]>([]);
  const [petName, setPetName] = useState("");

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/pets/${id}/weight`, { credentials: "include" })
      .then((r) => r.json())
      .then(setWeights);
    fetch(`/api/pets/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setPetName(d.name));
  }, [id]);

  async function handleDelete(weightId: string) {
    if (!confirm("確定要刪除這筆體重記錄嗎？")) return;
    const res = await fetch(`/api/pets/${id}/weight/${weightId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) setWeights(weights.filter((w) => w.id !== weightId));
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
        <span style={{ color: "#2d4a49", fontWeight: 500 }}>Weight</span>
      </div>

      <div
        style={{ maxWidth: "800px", margin: "0 auto", padding: "28px 24px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "Fraunces, serif",
                fontSize: "28px",
                fontWeight: 600,
                color: "#0f2423",
              }}
            >
              Weight Records
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#4a6968",
                fontWeight: 300,
                marginTop: "4px",
              }}
            >
              {weights.length} records for {petName}
            </div>
          </div>
          <Link
            href={`/pets/${id}/weight/create`}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              background: "#0E7C86",
              color: "white",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            + Add Weight
          </Link>
        </div>

        {weights.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              border: "1px solid #e4eaeb",
              padding: "48px",
              textAlign: "center",
              color: "#4a6968",
            }}
          >
            No weight records yet.
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {weights.map((w, i) => {
              const prev = weights[i + 1];
              const diff = prev
                ? parseFloat((w.weight - prev.weight).toFixed(1))
                : null;
              return (
                <div
                  key={w.id}
                  style={{
                    background: "white",
                    borderRadius: "16px",
                    border: "1px solid #e4eaeb",
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "Fraunces, serif",
                          fontSize: "24px",
                          fontWeight: 600,
                          color: "#0f2423",
                        }}
                      >
                        {w.weight}{" "}
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: 400,
                            color: "#4a6968",
                          }}
                        >
                          kg
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#4a6968",
                          marginTop: "2px",
                        }}
                      >
                        {new Date(w.date).toLocaleDateString()}
                      </div>
                    </div>
                    {diff !== null && (
                      <div
                        style={{
                          padding: "4px 10px",
                          borderRadius: "99px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background:
                            diff > 0
                              ? "#fdeaea"
                              : diff < 0
                                ? "#e6f9f0"
                                : "#F1F4F4",
                          color:
                            diff > 0
                              ? "#c0392b"
                              : diff < 0
                                ? "#1a7a4a"
                                : "#4a6968",
                        }}
                      >
                        {diff > 0 ? `+${diff}` : diff} kg
                      </div>
                    )}
                  </div>
                  {w.notes && (
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#4a6968",
                        background: "#F1F4F4",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        marginBottom: "12px",
                      }}
                    >
                      {w.notes}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Link
                      href={`/pets/${id}/weight/${w.id}/edit`}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        background: "transparent",
                        border: "1.5px solid #e4eaeb",
                        color: "#2d4a49",
                        textDecoration: "none",
                        fontSize: "13px",
                        fontWeight: 500,
                      }}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(w.id)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        background: "transparent",
                        border: "1.5px solid #fad0d0",
                        color: "#c0392b",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 500,
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
