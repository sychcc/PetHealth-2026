"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  gender: string | null;
  birthdate: string;
  chip_number: string | null;
  target_weight: number | null;
  photo_url: string | null;
};

type WeightRecord = {
  id: string;
  date: string;
  weight: number;
  notes: string | null;
};
type VaccineRecord = {
  id: string;
  vaccine_name: string;
  date: string;
  next_due_date: string | null;
  clinic: string | null;
};
type MedicalRecord = {
  id: string;
  brief_name: string;
  date: string;
  clinic: string | null;
  diagnosis: string | null;
  prescription: string | null;
  cost: number | null;
};
type ChecklistItem = {
  id: string;
  item_key: string;
  label: string;
  type: string;
  is_completed: boolean;
  completed_at: string | null;
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:ital,wght@0,300;0,600;1,600&display=swap');
  
  * { box-sizing: border-box; }

  /* 主 Grid*/
  .main-grid {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 20px;
  }

  /*Pet Header */
  .pet-header {
    background: white;
    border-radius: 16px;
    border: 1px solid #e4eaeb;
    padding: 24px 28px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .pet-avatar {
    width: 120px;
    height: 120px;
    border-radius: 16px;
    background: #f0fafa;
    border: 1px solid #e0f5f4;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    flex-shrink: 0;
    overflow: hidden;
  }

  .header-btns {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  /*Tabs*/
  .tabs-row {
    display: flex;
    gap: 4px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .tab-btn:hover { background: white; color: #2d4a49; }
  .btn-outline:hover { border-color: #2ec4ba; color: #0E7C86; }
  .cl-item:hover { background: #f0fafa; }

  /* Checklist 雙欄 */
  .checklist-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
  }

  .annual-col {
    padding-left: 20px;
    border-left: 1px solid #e4eaeb;
  }

  /* ===== Chat input ===== */
  .chat-input-group {
    display: flex;
    gap: 8px;
    width: 100%;
  }

  /* ===== PDF report info grid ===== */
  .info-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    font-size: 13px;
    color: #2d4a49;
  }
  .info-grid-item {
    width: 50%;
    padding: 6px 0;
    display: flex;
    gap: 8px;
  }

  /* RWD: Tablet */
  @media (max-width: 950px) {
    .main-grid {
      display: flex;
      flex-direction: column;
    }
    .main-col {
      order: 2;
    }
    .sidebar-col {
      order: 1;
    }
  }

  /* RWD Mobile */
  @media (max-width: 600px) {
    .pet-header {
      flex-direction: column;
      text-align: center;
      padding: 20px 16px;
    }
    .pet-avatar {
      width: 90px;
      height: 90px;
    }
    .pet-header > div:nth-child(2) {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .header-btns {
      justify-content: center;
      width: 100%;
    }
    .checklist-grid {
      grid-template-columns: 1fr;
    }
    .annual-col {
      border-left: none;
      border-top: 1px solid #eee;
      padding-left: 0;
      padding-top: 20px;
      margin-top: 12px;
    }
    .chat-input-group {
      flex-direction: column;
    }
    .chat-input-group button {
      width: 100%;
    }
    .info-grid-item {
      width: 100%;
    }
    .breadcrumb {
      padding: 0 16px !important;
    }
    .main-wrapper {
      padding: 16px 12px !important;
    }
  }

  @media print {
    .no-print { display: none !important; }
    body { background: white; }
  }
`;

export default function PetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [pet, setPet] = useState<Pet | null>(null);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [vaccineRecords, setVaccineRecords] = useState<VaccineRecord[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [error, setError] = useState("");
  const [id, setId] = useState<string>("");
  const [summary, setSummary] = useState("");
  const [fullReport, setFullReport] = useState("");
  const [showFull, setShowFull] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [analysisCreatedAt, setAnalysisCreatedAt] = useState<string | null>(
    null,
  );
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { question: string; answer: string; open: boolean }[]
  >([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [checklist, setCheckList] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, []);

  useEffect(() => {
    if (!id) return;
    const stored = localStorage.getItem(`chatHistory_${id}`);
    if (stored) setChatHistory(JSON.parse(stored));

    fetch(`/api/pets/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setPet(data);
      });
    fetch(`/api/pets/${id}/weight`, { credentials: "include" })
      .then((r) => r.json())
      .then(setWeightRecords);
    fetch(`/api/pets/${id}/vaccines`, { credentials: "include" })
      .then((r) => r.json())
      .then(setVaccineRecords);
    fetch(`/api/pets/${id}/medical`, { credentials: "include" })
      .then((r) => r.json())
      .then(setMedicalRecords);
    fetch(`/api/pets/${id}/checklist`, {
      method: "POST",
      credentials: "include",
    }).then(() => {
      fetch(`/api/pets/${id}/checklist`, { credentials: "include" })
        .then((r) => r.json())
        .then(setCheckList);
    });
    loadAiSummary();
    localStorage.setItem("lastViewedPetId", id);
  }, [id]);

  async function handleDelete() {
    if (!confirm("確定要刪除這隻寵物嗎？")) return;
    const res = await fetch(`/api/pets/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) router.push("/pets");
  }

  async function handleToggle(itemId: string, is_completed: boolean) {
    setCheckList((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              is_completed,
              completed_at: is_completed ? new Date().toISOString() : null,
            }
          : item,
      ),
    );

    const res = await fetch(`/api/pets/${id}/checklist/${itemId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_completed }),
    });

    if (!res.ok) {
      setCheckList((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                is_completed: !is_completed,
                completed_at: !is_completed ? new Date().toISOString() : null,
              }
            : item,
        ),
      );
    }
  }

  async function loadAiSummary() {
    setLoadingAi(true);
    fetch(`/api/pets/${id}/ai-summary`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setSummary(data.summary);
        setFullReport(data.full_report);
        setAnalysisCreatedAt(data.created_at || null);
        setLoadingAi(false);
      });
  }

  async function handleRefreshAi() {
    setLoadingAi(true);
    fetch(`/api/pets/${id}/ai-summary?refresh=true`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setSummary(data.summary);
        setFullReport(data.full_report);
        setAnalysisCreatedAt(data.created_at || null);
        setLoadingAi(false);
      });
  }

  async function handleChat() {
    if (!chatQuestion.trim()) return;
    setLoadingChat(true);
    const res = await fetch(`/api/pets/${id}/ai-chat`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: chatQuestion }),
    });
    const data = await res.json();
    const answer = data.answer.replace(/#{1,3}\s/g, "").replace(/\*\*/g, "");
    setChatHistory((prev) => {
      const updated = [
        { question: chatQuestion, answer, open: false },
        ...prev,
      ].slice(0, 10);
      localStorage.setItem(`chatHistory_${id}`, JSON.stringify(updated));
      return updated;
    });
    setChatQuestion("");
    setLoadingChat(false);
  }

  if (error)
    return <p style={{ padding: "32px", color: "#ef4444" }}>{error}</p>;
  if (!pet)
    return (
      <p
        style={{
          padding: "32px",
          color: "#4a6968",
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        Loading...
      </p>
    );

  const birthday = new Date(pet.birthdate);
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > birthday.getMonth() ||
    (today.getMonth() === birthday.getMonth() &&
      today.getDate() >= birthday.getDate());
  if (!hasBirthdayPassed) age -= 1;

  const oneTimeDone = checklist.filter(
    (i) => i.type === "one_time" && i.is_completed,
  ).length;
  const oneTimeTotal = checklist.filter((i) => i.type === "one_time").length;
  const annualDone = checklist.filter(
    (i) =>
      i.type === "annual" &&
      i.completed_at &&
      new Date(i.completed_at).getFullYear() === new Date().getFullYear(),
  ).length;
  const annualTotal = checklist.filter((i) => i.type === "annual").length;
  const totalDone = oneTimeDone + annualDone;
  const totalItems = oneTimeTotal + annualTotal;
  const completionRate =
    totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;
  const riskLevel =
    completionRate >= 80 ? "Low" : completionRate >= 50 ? "Medium" : "High";
  const riskColor =
    riskLevel === "Low"
      ? "#1a7a4a"
      : riskLevel === "Medium"
        ? "#d4730a"
        : "#c0392b";
  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference - (completionRate / 100) * circumference;

  const nextVaccine = vaccineRecords
    .filter((v) => v.next_due_date && new Date(v.next_due_date) > new Date())
    .sort(
      (a, b) =>
        new Date(a.next_due_date!).getTime() -
        new Date(b.next_due_date!).getTime(),
    )[0];

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
        className="no-print breadcrumb"
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
        <span style={{ color: "#2d4a49", fontWeight: 500 }}>{pet.name}</span>
      </div>

      <div
        className="main-wrapper"
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 24px" }}
      >
        {/* PET HEADER */}
        <div className="pet-header">
          <div className="pet-avatar">
            {pet.photo_url ? (
              <img
                src={pet.photo_url}
                alt={pet.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : pet.species === "Cat" ? (
              "🐱"
            ) : (
              "🐶"
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
                color: "#1a7a4a",
                background: "#e6f9f0",
                border: "1px solid #b3edd0",
                padding: "3px 9px",
                borderRadius: "99px",
                marginBottom: "6px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#1a7a4a",
                  display: "inline-block",
                }}
              ></span>
              Active
            </div>
            <div
              style={{
                fontFamily: "Fraunces, serif",
                fontSize: "28px",
                fontWeight: 600,
                color: "#0f2423",
                lineHeight: 1,
                wordBreak: "break-word",
              }}
            >
              {pet.name}
            </div>
            <div
              style={{ fontSize: "14px", color: "#4a6968", marginTop: "4px" }}
            >
              {pet.breed || pet.species}
              {pet.gender ? ` · ${pet.gender}` : ""} · {age} years old{" "}
              {pet.target_weight ? `· Target: ${pet.target_weight} kg` : ""}
            </div>
          </div>
          <div className="no-print header-btns">
            <Link
              href={`/pets/${id}/edit`}
              className="btn-outline"
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 500,
                background: "transparent",
                border: "1.5px solid #e4eaeb",
                color: "#2d4a49",
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 500,
                background: "transparent",
                border: "1.5px solid #fad0d0",
                color: "#c0392b",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="no-print tabs-row">
          {[
            ["Overview", `#`],
            ["Vaccines", `/pets/${id}/vaccines`],
            ["Weight", `/pets/${id}/weight`],
            ["Medical", `/pets/${id}/medical`],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="tab-btn"
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                color: label === "Overview" ? "#0e7c74" : "#4a6968",
                background: label === "Overview" ? "white" : "transparent",
                border:
                  label === "Overview"
                    ? "1px solid #e4eaeb"
                    : "1px solid transparent",
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* MAIN GRID */}
        <div className="main-grid">
          {/* ── 主內容欄 ── */}
          <div className="main-col" style={{ minWidth: 0 }}>
            {/* AI SUMMARY */}
            <div
              style={{
                background: "#0a3d3a",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(255,255,255,0.12)",
                  borderRadius: "99px",
                  padding: "4px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "white",
                  marginBottom: "14px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#2ec4ba",
                    display: "inline-block",
                  }}
                ></span>
                AI Health Analysis
                {analysisCreatedAt && (
                  <span
                    style={{ color: "rgba(255,255,255,0.4)", fontWeight: 400 }}
                  >
                    · {new Date(analysisCreatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              {loadingAi ? (
                <div
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.5)",
                    lineHeight: 1.75,
                    marginBottom: "18px",
                  }}
                >
                  Analysing {pet.name}&apos;s health data...
                </div>
              ) : summary ? (
                <div
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.8)",
                    lineHeight: 1.75,
                    marginBottom: "18px",
                  }}
                >
                  {summary}
                </div>
              ) : (
                <div
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.5)",
                    lineHeight: 1.75,
                    marginBottom: "18px",
                  }}
                >
                  No analysis yet.
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap" as const,
                }}
              >
                <button
                  onClick={() => setShowFull(!showFull)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 500,
                    background: "white",
                    color: "#0e5c57",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {showFull ? "Hide full report" : "View full report"}
                </button>
                <button
                  onClick={handleRefreshAi}
                  disabled={loadingAi}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 500,
                    background: "transparent",
                    color: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    cursor: "pointer",
                  }}
                >
                  {loadingAi ? "Analysing..." : "Re-analyse"}
                </button>
              </div>
              {showFull && fullReport && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "16px",
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "10px",
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: 1.75,
                    wordBreak: "break-word",
                  }}
                >
                  {fullReport}
                </div>
              )}
            </div>

            {/* OVERALL HEALTH RISK */}
            {checklist.length > 0 && (
              <div
                style={{
                  background: "white",
                  borderRadius: "16px",
                  border: "1px solid #e4eaeb",
                  padding: "24px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#0f2423",
                    marginBottom: "18px",
                  }}
                >
                  Overall Health Risk
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: "24px",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100px",
                      height: "100px",
                    }}
                  >
                    <svg
                      width="100"
                      height="100"
                      style={{ transform: "rotate(-90deg)" }}
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#e4eaeb"
                        strokeWidth="10"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={riskColor}
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: riskColor,
                        }}
                      >
                        {riskLevel}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          textTransform: "uppercase" as const,
                          letterSpacing: "0.06em",
                          color: "#4a6968",
                        }}
                      >
                        Risk
                      </div>
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "#0f2423",
                        marginBottom: "6px",
                      }}
                    >
                      {completionRate}% health tasks completed
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#4a6968",
                        lineHeight: 1.6,
                      }}
                    >
                      {oneTimeDone}/{oneTimeTotal} one-time tasks done ·{" "}
                      {annualDone}/{annualTotal} annual tasks done for{" "}
                      {new Date().getFullYear()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CHECKLIST */}
            {checklist.length > 0 && (
              <div
                style={{
                  background: "white",
                  borderRadius: "16px",
                  border: "1px solid #e4eaeb",
                  padding: "24px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#0f2423",
                    marginBottom: "18px",
                  }}
                >
                  Health Checklist
                </div>
                <div className="checklist-grid">
                  {/* One-time */}
                  <div style={{ paddingRight: "20px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          textTransform: "uppercase" as const,
                          letterSpacing: "0.08em",
                          color: "#4a6968",
                        }}
                      >
                        One-time
                      </span>
                      <span style={{ fontSize: "12px", color: "#4a6968" }}>
                        {oneTimeDone} / {oneTimeTotal}
                      </span>
                    </div>
                    <div
                      style={{
                        height: "4px",
                        background: "#e4eaeb",
                        borderRadius: "99px",
                        marginBottom: "14px",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          background: "#0E7C86",
                          borderRadius: "99px",
                          width: `${oneTimeTotal > 0 ? Math.round((oneTimeDone / oneTimeTotal) * 100) : 0}%`,
                        }}
                      />
                    </div>
                    {checklist
                      .filter((i) => i.type === "one_time")
                      .map((item) => (
                        <div
                          key={item.id}
                          className="cl-item"
                          onClick={() =>
                            handleToggle(item.id, !item.is_completed)
                          }
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "8px 6px",
                            borderBottom: "1px solid #F1F4F4",
                            cursor: "pointer",
                            borderRadius: "6px",
                          }}
                        >
                          <div
                            style={{
                              width: "18px",
                              height: "18px",
                              borderRadius: "5px",
                              flexShrink: 0,
                              background: item.is_completed
                                ? "#0E7C86"
                                : "transparent",
                              border: `1.5px solid ${item.is_completed ? "#0E7C86" : "#e4eaeb"}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "11px",
                              color: "white",
                            }}
                          >
                            {item.is_completed && "✓"}
                          </div>
                          <span
                            style={{
                              fontSize: "13px",
                              color: item.is_completed ? "#4a6968" : "#2d4a49",
                              textDecoration: item.is_completed
                                ? "line-through"
                                : "none",
                            }}
                          >
                            {item.label}
                          </span>
                        </div>
                      ))}
                  </div>

                  {/* Annual */}
                  <div className="annual-col">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          textTransform: "uppercase" as const,
                          letterSpacing: "0.08em",
                          color: "#4a6968",
                        }}
                      >
                        Annual ({new Date().getFullYear()})
                      </span>
                      <span style={{ fontSize: "12px", color: "#4a6968" }}>
                        {annualDone} / {annualTotal}
                      </span>
                    </div>
                    <div
                      style={{
                        height: "4px",
                        background: "#e4eaeb",
                        borderRadius: "99px",
                        marginBottom: "14px",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          background: "#0E7C86",
                          borderRadius: "99px",
                          width: `${annualTotal > 0 ? Math.round((annualDone / annualTotal) * 100) : 0}%`,
                        }}
                      />
                    </div>
                    {checklist
                      .filter((i) => i.type === "annual")
                      .map((item) => {
                        const completedThisYear = !!(
                          item.completed_at &&
                          new Date(item.completed_at).getFullYear() ===
                            new Date().getFullYear()
                        );
                        return (
                          <div
                            key={item.id}
                            className="cl-item"
                            onClick={() =>
                              handleToggle(item.id, !completedThisYear)
                            }
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              padding: "8px 6px",
                              borderBottom: "1px solid #F1F4F4",
                              cursor: "pointer",
                              borderRadius: "6px",
                            }}
                          >
                            <div
                              style={{
                                width: "18px",
                                height: "18px",
                                borderRadius: "5px",
                                flexShrink: 0,
                                background: completedThisYear
                                  ? "#0E7C86"
                                  : "transparent",
                                border: `1.5px solid ${completedThisYear ? "#0E7C86" : "#e4eaeb"}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "11px",
                                color: "white",
                              }}
                            >
                              {completedThisYear && "✓"}
                            </div>
                            <span
                              style={{
                                fontSize: "13px",
                                color: completedThisYear
                                  ? "#4a6968"
                                  : "#2d4a49",
                                textDecoration: completedThisYear
                                  ? "line-through"
                                  : "none",
                              }}
                            >
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* WEIGHT CHART */}
            {weightRecords.length > 0 && (
              <div
                style={{
                  background: "white",
                  borderRadius: "16px",
                  border: "1px solid #e4eaeb",
                  padding: "24px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "18px",
                    flexWrap: "wrap" as const,
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#0f2423",
                    }}
                  >
                    Weight Trend
                  </div>
                  <span style={{ fontSize: "13px", color: "#4a6968" }}>
                    Current: {weightRecords[weightRecords.length - 1]?.weight}{" "}
                    kg
                  </span>
                </div>
                <div style={{ height: "200px" }}>
                  <Line
                    data={{
                      labels: weightRecords.map((w) => w.date.split("T")[0]),
                      datasets: [
                        {
                          label: "Weight (kg)",
                          data: weightRecords.map((w) => w.weight),
                          borderColor: "#0E7C86",
                          backgroundColor: "rgba(14,124,134,0.08)",
                          tension: 0.3,
                          pointBackgroundColor: "#0E7C86",
                          pointRadius: 4,
                        },
                        ...(pet.target_weight
                          ? [
                              {
                                label: "Target (kg)",
                                data: weightRecords.map(
                                  () => pet.target_weight,
                                ),
                                borderColor: "#e4eaeb",
                                borderDash: [4, 4],
                                tension: 0,
                                pointRadius: 0,
                              },
                            ]
                          : []),
                      ],
                    }}
                    options={{
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { grid: { color: "#f0fafa" } },
                        x: { grid: { display: false } },
                      },
                    }}
                  />
                </div>
              </div>
            )}

            {/* PDF 報告區 */}
            <div
              id="pdf-report"
              style={{
                background: "white",
                borderRadius: "16px",
                border: "1px solid #e4eaeb",
                padding: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "20px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid #e4eaeb",
                  flexWrap: "wrap" as const,
                  gap: "12px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "Fraunces, serif",
                      fontSize: "22px",
                      fontWeight: 600,
                      color: "#0f2423",
                    }}
                  >
                    {pet.name}&apos;s Health Report
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#4a6968",
                      marginTop: "4px",
                    }}
                  >
                    Generated: {new Date().toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => window.print()}
                  className="no-print"
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    background: "#0E7C86",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Download PDF
                </button>
              </div>

              {/* 基本資料 */}
              <div
                style={{
                  marginBottom: "20px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid #e4eaeb",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#0f2423",
                    marginBottom: "12px",
                  }}
                >
                  Basic Information
                </div>
                <div className="info-grid">
                  {[
                    ["Name", pet.name],
                    ["Species", pet.species],
                    ["Breed", pet.breed || "—"],
                    ["Gender", pet.gender || "—"],
                    ["Birthday", new Date(pet.birthdate).toLocaleDateString()],
                    ["Age", `${age} years old`],
                    ...(pet.chip_number ? [["Chip", pet.chip_number]] : []),
                    ...(pet.target_weight
                      ? [["Target Weight", `${pet.target_weight} kg`]]
                      : []),
                  ].map(([label, value]) => (
                    <div key={label} className="info-grid-item">
                      <span style={{ color: "#4a6968", minWidth: "100px" }}>
                        {label}:
                      </span>
                      <span style={{ fontWeight: 500 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 疫苗紀錄 */}
              {vaccineRecords.length > 0 && (
                <div
                  style={{
                    marginBottom: "20px",
                    paddingBottom: "16px",
                    borderBottom: "1px solid #e4eaeb",
                  }}
                >
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#0f2423",
                    }}
                  >
                    Vaccines
                  </div>
                  {vaccineRecords.map((v) => (
                    <div
                      key={v.id}
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #F1F4F4",
                        fontSize: "13px",
                        color: "#2d4a49",
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "wrap" as const,
                        gap: "4px",
                      }}
                    >
                      <div>
                        <strong>{v.vaccine_name}</strong>
                        {v.clinic && (
                          <span style={{ color: "#4a6968" }}>
                            {" "}
                            · {v.clinic}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#0f2423",
                        }}
                      >
                        {v.date.split("T")[0]}
                        {v.next_due_date && (
                          <span style={{ color: "#d4730a" }}>
                            {" "}
                            · Next: {v.next_due_date.split("T")[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 就醫紀錄 */}
              {medicalRecords.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#0f2423",
                    }}
                  >
                    Medical Records
                  </div>
                  {medicalRecords.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #F1F4F4",
                        fontSize: "13px",
                        color: "#2d4a49",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                          flexWrap: "wrap" as const,
                          gap: "4px",
                        }}
                      >
                        <strong>{m.brief_name}</strong>
                        <span style={{ color: "#4a6968" }}>
                          {m.date.split("T")[0]}
                          {m.cost ? ` · NTD ${m.cost}` : ""}
                        </span>
                      </div>
                      {m.clinic && (
                        <div style={{ color: "#4a6968" }}>📍 {m.clinic}</div>
                      )}
                      {m.diagnosis && (
                        <div style={{ color: "#4a6968" }}>
                          Diagnosis: {m.diagnosis}
                        </div>
                      )}
                      {m.prescription && (
                        <div style={{ color: "#4a6968" }}>
                          Prescription: {m.prescription}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR*/}
          <div className="sidebar-col no-print">
            {/* NEXT APPOINTMENT */}
            {nextVaccine && (
              <div
                style={{
                  background: "#0e5c57",
                  borderRadius: "16px",
                  padding: "20px",
                  marginBottom: "16px",
                  color: "white",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.1em",
                    color: "rgba(255,255,255,0.5)",
                    marginBottom: "12px",
                  }}
                >
                  Next Appointment
                </div>
                <div
                  style={{
                    fontFamily: "Fraunces, serif",
                    fontSize: "28px",
                    fontWeight: 600,
                    lineHeight: 1,
                    marginBottom: "4px",
                  }}
                >
                  {new Date(nextVaccine.next_due_date!).toLocaleDateString(
                    "en",
                    {
                      month: "short",
                      day: "numeric",
                    },
                  )}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.7)",
                    marginBottom: "12px",
                  }}
                >
                  {nextVaccine.vaccine_name}
                </div>
                {nextVaccine.clinic && (
                  <div
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      padding: "10px 12px",
                      fontSize: "13px",
                      wordBreak: "break-word",
                    }}
                  >
                    📍 {nextVaccine.clinic}
                  </div>
                )}
              </div>
            )}

            {/* AI CHAT */}
            <div
              style={{
                background: "white",
                border: "1px solid #e4eaeb",
                borderRadius: "16px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "4px",
                }}
              >
                <span style={{ fontSize: "16px" }}>✦</span>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#0f2423",
                  }}
                >
                  Ask AI about {pet.name}
                </div>
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#4a6968",
                  marginBottom: "14px",
                }}
              >
                Get instant health advice
              </div>

              <div
                className="chat-input-group"
                style={{ marginBottom: chatHistory.length > 0 ? "12px" : "0" }}
              >
                <input
                  type="text"
                  value={chatQuestion}
                  onChange={(e) => setChatQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleChat()}
                  placeholder={`e.g. Is ${pet.name}'s weight healthy?`}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1.5px solid #e4eaeb",
                    background: "#F1F4F4",
                    fontSize: "13px",
                    fontFamily: "DM Sans, sans-serif",
                    color: "#0f2423",
                    outline: "none",
                    boxSizing: "border-box" as const,
                    width: "100%",
                    minWidth: 0,
                  }}
                />
                <button
                  onClick={handleChat}
                  disabled={loadingChat || !chatQuestion.trim()}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "#0E7C86",
                    color: "white",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap" as const,
                  }}
                >
                  {loadingChat ? "..." : "Ask"}
                </button>
              </div>

              {/* Chat History */}
              {chatHistory.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {chatHistory.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e4eaeb",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        onClick={() =>
                          setChatHistory((prev) =>
                            prev.map((h, idx) =>
                              idx === i ? { ...h, open: !h.open } : h,
                            ),
                          )
                        }
                        style={{
                          padding: "10px 12px",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: item.open ? "#f0fafa" : "white",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "#0f2423",
                            wordBreak: "break-word",
                            minWidth: 0,
                          }}
                        >
                          {item.question}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#4a6968",
                            flexShrink: 0,
                          }}
                        >
                          {item.open ? "▲" : "▼"}
                        </span>
                      </div>
                      {item.open && (
                        <div
                          style={{
                            padding: "10px 12px",
                            background: "#f0fafa",
                            fontSize: "13px",
                            color: "#2d4a49",
                            lineHeight: 1.65,
                            borderTop: "1px solid #e0f5f4",
                            wordBreak: "break-word",
                          }}
                        >
                          {item.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
