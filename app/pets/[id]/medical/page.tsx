"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Medical = {
  id: string;
  brief_name: string;
  date: string;
  clinic: string | null;
  symptoms: string | null;
  diagnosis: string | null;
  prescription: string | null;
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

  .medical-info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-bottom: 12px;
  }

  @media (max-width: 600px) {
    .add-btn {
      padding: 8px 12px;
      font-size: 13px;
      border-radius: 8px;
    }
    .medical-info-grid {
      grid-template-columns: 1fr;
    }
    .breadcrumb {
      padding: 0 16px !important;
    }
    .main-wrapper {
      padding: 20px 16px !important;
    }
  }
`;

export default function MedicalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState("");
  const [medicals, setMedicals] = useState<Medical[]>([]);
  const [petName, setPetName] = useState("");

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/pets/${id}/medical`, { credentials: "include" })
      .then((r) => r.json())
      .then(setMedicals);
    fetch(`/api/pets/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setPetName(d.name));
  }, [id]);

  async function handleDelete(medicalId: string) {
    if (!confirm("確定要刪除這筆醫療記錄嗎？")) return;
    const res = await fetch(`/api/pets/${id}/medical/${medicalId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) setMedicals(medicals.filter((m) => m.id !== medicalId));
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
        <span style={{ color: "#2d4a49", fontWeight: 500 }}>Medical</span>
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
              Medical Records
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#4a6968",
                fontWeight: 300,
                marginTop: "4px",
              }}
            >
              {medicals.length} records for {petName}
            </div>
          </div>
          <Link href={`/pets/${id}/medical/create`} className="add-btn">
            + Add Record
          </Link>
        </div>

        {/* MEDICAL LIST */}
        {medicals.length === 0 ? (
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
            No medical records yet.
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {medicals.map((m) => (
              <div
                key={m.id}
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
                      {m.brief_name}
                    </div>
                    <div style={{ fontSize: "13px", color: "#4a6968" }}>
                      {new Date(m.date).toLocaleDateString()}
                      {m.clinic && ` · ${m.clinic}`}
                    </div>
                  </div>
                  {m.cost && (
                    <div
                      style={{
                        padding: "4px 10px",
                        borderRadius: "99px",
                        fontSize: "12px",
                        fontWeight: 600,
                        flexShrink: 0,
                        background: "#F1F4F4",
                        color: "#2d4a49",
                      }}
                    >
                      NTD {m.cost}
                    </div>
                  )}
                </div>

                <div className="medical-info-grid">
                  {m.symptoms && (
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
                        Symptoms
                      </div>
                      <div style={{ fontSize: "13px", color: "#0f2423" }}>
                        {m.symptoms}
                      </div>
                    </div>
                  )}
                  {m.diagnosis && (
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
                        Diagnosis
                      </div>
                      <div style={{ fontSize: "13px", color: "#0f2423" }}>
                        {m.diagnosis}
                      </div>
                    </div>
                  )}
                  {m.prescription && (
                    <div
                      style={{
                        background: "#F1F4F4",
                        borderRadius: "8px",
                        padding: "10px 12px",
                        gridColumn: "1 / -1",
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
                        Prescription
                      </div>
                      <div style={{ fontSize: "13px", color: "#0f2423" }}>
                        {m.prescription}
                      </div>
                    </div>
                  )}
                </div>

                {m.photo_url && (
                  <img
                    src={m.photo_url}
                    alt="medical record"
                    onClick={() => window.open(m.photo_url!, "_blank")}
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      marginBottom: "12px",
                      cursor: "pointer",
                    }}
                  />
                )}

                <div style={{ display: "flex", gap: "8px" }}>
                  <Link
                    href={`/pets/${id}/medical/${m.id}/edit`}
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
                    onClick={() => handleDelete(m.id)}
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
