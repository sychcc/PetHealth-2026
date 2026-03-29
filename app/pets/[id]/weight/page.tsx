"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Weight = {
  id: string;
  weight: number;
  date: string;
  notes: string | null;
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:ital,wght@0,300;0,600;1,600&display=swap');

  * { box-sizing: border-box; }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    gap: 12px;
  }

  .add-btn {
    padding: 10px 18px;
    border-radius: 10px;
    background: #0E7C86;
    color: white;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    flex-shrink: 0;
  }

  @media (max-width: 600px) {
    .add-btn {
      padding: 8px 12px;
      font-size: 13px;
      border-radius: 8px;
    }
    .breadcrumb {
      padding: 0 16px !important;
    }
    .main-wrapper {
      padding: 20px 16px !important;
    }
  }
`;

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

      {/* BREADCRUMB */}
      <div
        className="breadcrumb"
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
        className="main-wrapper"
        style={{ maxWidth: "800px", margin: "0 auto", padding: "28px 24px" }}
      >
        {/* PAGE HEADER */}
        <div className="page-header">
          <div style={{ minWidth: 0 }}>
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
          <Link href={`/pets/${id}/weight/create`} className="add-btn">
            + Add Weight
          </Link>
        </div>

        {/* WEIGHT LIST */}
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
                      gap: "8px",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
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
                          flexShrink: 0,
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
