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

const css = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:ital,wght@0,300;0,600;1,600&display=swap');`;

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
        <span style={{ color: "#2d4a49", fontWeight: 500 }}>Medical</span>
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
          <Link
            href={`/pets/${id}/medical/create`}
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
            + Add Record
          </Link>
        </div>

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
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "17px",
                        fontWeight: 600,
                        color: "#0f2423",
                        marginBottom: "4px",
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
                        background: "#F1F4F4",
                        color: "#2d4a49",
                      }}
                    >
                      NTD {m.cost}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "8px",
                    marginBottom: "12px",
                  }}
                >
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
                  <>
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
                  </>
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
