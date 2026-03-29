"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Vaccine = {
  id: string;
  vaccine_name: string;
  date: string;
  next_due_date: string | null;
  clinic: string | null;
  vet_name: string | null;
  cost: number | null;
  photo_url: string | null;
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

  .vaccine-info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 12px;
  }

  @media (max-width: 600px) {
    .page-header {
      flex-direction: row;
      align-items: flex-start;
    }
    .add-btn {
      padding: 8px 12px;
      font-size: 13px;
      border-radius: 8px;
    }
    .vaccine-info-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .breadcrumb {
      padding: 0 16px !important;
    }
    .main-wrapper {
      padding: 20px 16px !important;
    }
  }
`;

export default function VaccinesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState("");
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [petName, setPetName] = useState("");

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/pets/${id}/vaccines`, { credentials: "include" })
      .then((r) => r.json())
      .then(setVaccines);
    fetch(`/api/pets/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setPetName(d.name));
  }, [id]);

  async function handleDelete(vaccineId: string) {
    if (!confirm("確定要刪除這筆疫苗記錄嗎？")) return;
    const res = await fetch(`/api/pets/${id}/vaccines/${vaccineId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) setVaccines(vaccines.filter((v) => v.id !== vaccineId));
  }

  function isDueSoon(d: string | null) {
    if (!d) return false;
    const diff = new Date(d).getTime() - new Date().getTime();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  }

  function isExpired(d: string | null) {
    if (!d) return false;
    return new Date(d).getTime() < new Date().getTime();
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
        <span style={{ color: "#2d4a49", fontWeight: 500 }}>Vaccines</span>
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
              Vaccine Records
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#4a6968",
                fontWeight: 300,
                marginTop: "4px",
              }}
            >
              {vaccines.length} records for {petName}
            </div>
          </div>
          <Link href={`/pets/${id}/vaccines/create`} className="add-btn">
            + Add Vaccine
          </Link>
        </div>

        {/* VACCINE LIST */}
        {vaccines.length === 0 ? (
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
            No vaccine records yet.
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {vaccines.map((v) => (
              <div
                key={v.id}
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
                    alignItems: "flex-start",
                    marginBottom: "12px",
                    gap: "8px",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "17px",
                        fontWeight: 600,
                        color: "#0f2423",
                        marginBottom: "4px",
                        wordBreak: "break-word",
                      }}
                    >
                      {v.vaccine_name}
                    </div>
                    <div style={{ fontSize: "13px", color: "#4a6968" }}>
                      Vaccinated: {new Date(v.date).toLocaleDateString()}
                    </div>
                  </div>
                  {v.next_due_date && (
                    <div
                      style={{
                        padding: "4px 10px",
                        borderRadius: "99px",
                        fontSize: "12px",
                        fontWeight: 600,
                        flexShrink: 0,
                        background: isExpired(v.next_due_date)
                          ? "#fdeaea"
                          : isDueSoon(v.next_due_date)
                            ? "#fff4e6"
                            : "#e6f9f0",
                        color: isExpired(v.next_due_date)
                          ? "#c0392b"
                          : isDueSoon(v.next_due_date)
                            ? "#d4730a"
                            : "#1a7a4a",
                      }}
                    >
                      {isExpired(v.next_due_date)
                        ? "Expired"
                        : isDueSoon(v.next_due_date)
                          ? "Due Soon"
                          : "Current"}
                    </div>
                  )}
                </div>

                <div className="vaccine-info-grid">
                  {v.next_due_date && (
                    <div
                      style={{
                        background: "#F1F4F4",
                        borderRadius: "8px",
                        padding: "10px 12px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#4a6968",
                          marginBottom: "2px",
                          textTransform: "uppercase" as const,
                          letterSpacing: "0.06em",
                        }}
                      >
                        Next Due
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#0f2423",
                        }}
                      >
                        {new Date(v.next_due_date).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  {v.clinic && (
                    <div
                      style={{
                        background: "#F1F4F4",
                        borderRadius: "8px",
                        padding: "10px 12px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#4a6968",
                          marginBottom: "2px",
                          textTransform: "uppercase" as const,
                          letterSpacing: "0.06em",
                        }}
                      >
                        Clinic
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#0f2423",
                        }}
                      >
                        {v.clinic}
                      </div>
                    </div>
                  )}
                  {v.cost && (
                    <div
                      style={{
                        background: "#F1F4F4",
                        borderRadius: "8px",
                        padding: "10px 12px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#4a6968",
                          marginBottom: "2px",
                          textTransform: "uppercase" as const,
                          letterSpacing: "0.06em",
                        }}
                      >
                        Cost
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#0f2423",
                        }}
                      >
                        NTD {v.cost}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <Link
                    href={`/pets/${id}/vaccines/${v.id}/edit`}
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
                    onClick={() => handleDelete(v.id)}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
