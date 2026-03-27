"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
// 註冊chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
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
// 體重追蹤-實際體重
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

export default function PetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [pet, setPet] = useState<Pet | null>(null);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  //用來判斷要不要顯示取得ai健康分析的按鈕
  const [vaccineRecords, setVaccineRecords] = useState<VaccineRecord[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  //
  const [error, setError] = useState("");
  const [id, setId] = useState<string>("");
  // for ai-summary
  const [summary, setSummary] = useState("");
  const [fullReport, setFullReport] = useState("");
  const [showFull, setShowFull] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [analysisCreatedAt, setAnalysisCreatedAt] = useState<string | null>(
    null,
  );
  // for ai-chat
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  // for checklist
  const [checklist, setCheckList] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/pets/${id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setPet(data);
        }
      });
    //獲取實際體重
    fetch(`/api/pets/${id}/weight`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setWeightRecords(data));
    //疫苗紀錄
    fetch(`/api/pets/${id}/vaccines`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setVaccineRecords(data));
    //醫療紀錄
    fetch(`/api/pets/${id}/medical`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setMedicalRecords(data));
    //checklist
    //先post一次確定存在清單，如果沒有系統會自動建立
    fetch(`/api/pets/${id}/checklist`, {
      method: "POST",
      credentials: "include",
    }).then(() => {
      fetch(`/api/pets/${id}/checklist`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => setCheckList(data));
    });
    //自動Load ai分析
    loadAiSummary();
  }, [id]);

  async function handleDelete() {
    if (!confirm("確定要刪除這隻寵物嗎？")) return;
    const res = await fetch(`/api/pets/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      router.push("/pets");
    }
  }

  if (error) return <p>{error}</p>;
  if (!pet) return <p>Loading...</p>;

  //處理checklist的打勾 Or 取消打勾
  async function handleToggle(itemId: string, is_completed: boolean) {
    const res = await fetch(`/api/pets/${id}/checklist/${itemId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_completed }),
    });
    if (res.ok) {
      setCheckList(
        checklist.map((item) =>
          item.id === itemId ? { ...item, is_completed } : item,
        ),
      );
    }
  }

  //ai-summay 有兩個function
  //1. 頁面載入時自動打（不帶fresh)
  async function loadAiSummary() {
    setLoadingAi(true);
    fetch(`/api/pets/${id}/ai-summary`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setSummary(data.summary);
        setFullReport(data.full_report);
        setAnalysisCreatedAt(data.created_at || null);
        setLoadingAi(false);
      });
  }
  //2.使用者點重新分析（帶fresh=true)
  async function handleRefreshAi() {
    setLoadingAi(true);
    fetch(`/api/pets/${id}/ai-summary?refresh=true`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setSummary(data.summary);
        setFullReport(data.full_report);
        setAnalysisCreatedAt(data.created_at || null);
        setLoadingAi(false);
      });
  }
  //for ai-chat
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
    setChatAnswer(data.answer);
    setLoadingChat(false);
  }

  // pdf
  async function handleDownloadPdf() {
    window.print();
  }

  // age & 星座
  const birthday = new Date(pet.birthdate);
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > birthday.getMonth() ||
    (today.getMonth() === birthday.getMonth() &&
      today.getDate() >= birthday.getDate());
  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 24px" }}>
      {/* 寵物基本資料區 */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          alignItems: "flex-start",
          marginBottom: "24px",
        }}
      >
        {pet.photo_url ? (
          <img
            src={pet.photo_url}
            alt={pet.name}
            style={{
              width: "140px",
              height: "140px",
              objectFit: "cover",
              borderRadius: "12px",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: "140px",
              height: "140px",
              background: "#1f2937",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
              flexShrink: 0,
            }}
          >
            No Photo
          </div>
        )}
        <div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            {pet.name}
          </h1>
          <p style={{ color: "#9ca3af", margin: "4px 0" }}>
            {pet.species}·{pet.breed}·{pet.gender}
          </p>
          <p style={{ color: "#9ca3af", margin: "4px 0" }}>
            {new Date(pet.birthdate).toLocaleDateString()} · {age} years old
          </p>
          {pet.chip_number && (
            <p style={{ color: "#9ca3af", margin: "4px 0" }}>
              Chip: {pet.chip_number}
            </p>
          )}
          {pet.target_weight && (
            <p style={{ color: "#9ca3af", margin: "4px 0" }}>
              Target: {pet.target_weight} kg
            </p>
          )}
        </div>
      </div>

      {/* 操作按鈕 */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "32px",
          paddingBottom: "24px",
          borderBottom: "1px solid #1f2937",
        }}
      >
        <Link
          href={`/pets/${id}/vaccines`}
          style={{
            background: "#1f2937",
            color: "white",
            padding: "8px 14px",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          Vaccines
        </Link>
        <Link
          href={`/pets/${id}/weight`}
          style={{
            background: "#1f2937",
            color: "white",
            padding: "8px 14px",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          Weight
        </Link>
        <Link
          href={`/pets/${id}/medical`}
          style={{
            background: "#1f2937",
            color: "white",
            padding: "8px 14px",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          Medical
        </Link>
        <Link
          href={`/pets/${id}/edit`}
          style={{
            background: "#1f2937",
            color: "white",
            padding: "8px 14px",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          Edit
        </Link>
        <button
          onClick={handleDelete}
          style={{
            background: "#1f2937",
            color: "#ef4444",
            padding: "8px 14px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Delete
        </button>
      </div>

      {/* Dashboard */}
      {weightRecords.length === 0 &&
        medicalRecords.length === 0 &&
        vaccineRecords.length === 0 && (
          <p style={{ color: "#6b7280", textAlign: "center", padding: "24px" }}>
            Looks like there's no data. Add your pet's first health record to
            get started!
          </p>
        )}

      {(weightRecords.length > 0 ||
        medicalRecords.length > 0 ||
        vaccineRecords.length > 0) && (
        <div style={{ marginBottom: "24px" }}>
          {/* 必做事項清單 */}
          {checklist.length > 0 && (
            <div
              style={{
                marginBottom: "24px",
                background: "#1f2937",
                borderRadius: "10px",
                padding: "20px",
              }}
            >
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  marginBottom: "16px",
                }}
              >
                必做事項清單
              </h2>

              <div style={{ display: "flex", gap: "20px" }}>
                {/* 一次性 */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <p
                      style={{ fontSize: "13px", color: "#9ca3af", margin: 0 }}
                    >
                      一次性
                    </p>
                    <p
                      style={{ fontSize: "13px", color: "#9ca3af", margin: 0 }}
                    >
                      {
                        checklist.filter(
                          (i) => i.type === "one_time" && i.is_completed,
                        ).length
                      }{" "}
                      / {checklist.filter((i) => i.type === "one_time").length}
                    </p>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      background: "#374151",
                      borderRadius: "99px",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: "99px",
                        background: "#3dbfa0",
                        width: `${Math.round((checklist.filter((i) => i.type === "one_time" && i.is_completed).length / checklist.filter((i) => i.type === "one_time").length) * 100)}%`,
                      }}
                    />
                  </div>
                  {checklist
                    .filter((i) => i.type === "one_time")
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() =>
                          handleToggle(item.id, !item.is_completed)
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "8px 0",
                          cursor: "pointer",
                          borderBottom: "1px solid #374151",
                        }}
                      >
                        <div
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "4px",
                            flexShrink: 0,
                            background: item.is_completed
                              ? "#3dbfa0"
                              : "transparent",
                            border: `1.5px solid ${item.is_completed ? "#3dbfa0" : "#6b7280"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {item.is_completed && (
                            <span style={{ color: "white", fontSize: "12px" }}>
                              ✓
                            </span>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: "14px",
                            color: item.is_completed ? "#6b7280" : "white",
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

                {/* 分隔線 */}
                <div style={{ width: "1px", background: "#374151" }} />

                {/* 每年定期 */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <p
                      style={{ fontSize: "13px", color: "#9ca3af", margin: 0 }}
                    >
                      每年定期（{new Date().getFullYear()}）
                    </p>
                    <p
                      style={{ fontSize: "13px", color: "#9ca3af", margin: 0 }}
                    >
                      {
                        checklist.filter(
                          (i) =>
                            i.type === "annual" &&
                            i.completed_at &&
                            new Date(i.completed_at).getFullYear() ===
                              new Date().getFullYear(),
                        ).length
                      }{" "}
                      / {checklist.filter((i) => i.type === "annual").length}
                    </p>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      background: "#374151",
                      borderRadius: "99px",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: "99px",
                        background: "#3dbfa0",
                        width: `${Math.round((checklist.filter((i) => i.type === "annual" && i.completed_at && new Date(i.completed_at).getFullYear() === new Date().getFullYear()).length / checklist.filter((i) => i.type === "annual").length) * 100)}%`,
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
                          onClick={() =>
                            handleToggle(item.id, !completedThisYear)
                          }
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "8px 0",
                            cursor: "pointer",
                            borderBottom: "1px solid #374151",
                          }}
                        >
                          <div
                            style={{
                              width: "18px",
                              height: "18px",
                              borderRadius: "4px",
                              flexShrink: 0,
                              background: completedThisYear
                                ? "#3dbfa0"
                                : "transparent",
                              border: `1.5px solid ${completedThisYear ? "#3dbfa0" : "#6b7280"}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {completedThisYear && (
                              <span
                                style={{ color: "white", fontSize: "12px" }}
                              >
                                ✓
                              </span>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: "14px",
                              color: completedThisYear ? "#6b7280" : "white",
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
          {/* AI 對話 */}
          <div
            style={{
              marginBottom: "24px",
              background: "#1f2937",
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              詢問 AI 助理
            </h2>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <input
                type="text"
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChat()}
                placeholder={`問關於 ${pet.name} 的健康問題...`}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #374151",
                  background: "#111827",
                  color: "white",
                  fontSize: "14px",
                }}
              />
              <button
                onClick={handleChat}
                disabled={loadingChat || !chatQuestion.trim()}
                style={{
                  background: "#4b5563",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                {loadingChat ? "思考中..." : "送出"}
              </button>
            </div>
            {chatAnswer && (
              <div
                style={{
                  background: "#111827",
                  borderRadius: "8px",
                  padding: "16px",
                }}
              >
                <p style={{ color: "#d1d5db", lineHeight: "1.8", margin: 0 }}>
                  {chatAnswer}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleRefreshAi}
            disabled={loadingAi}
            style={{
              background: "#4b5563",
              color: "white",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            {loadingAi ? "分析中..." : "重新分析AI健康"}
          </button>
          {analysisCreatedAt && (
            <span style={{ fontSize: "13px", color: "#9ca3af" }}>
              上次分析：{new Date(analysisCreatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
      {/* 寵物健康報告 */}
      <div
        id="pdf-report"
        style={{
          background: "#ffffff",
          color: "#000000",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        <h2 style={{ color: "#000", marginBottom: "4px" }}>
          {pet.name}'s Heath Dashboard
        </h2>
        <p style={{ color: "#555", fontSize: "13px", marginBottom: "16px" }}>
          Created At：{new Date().toLocaleDateString()}
        </p>

        {/* 寵物基本資料 */}
        <div
          style={{
            borderBottom: "1px solid #eee",
            paddingBottom: "12px",
            marginBottom: "16px",
          }}
        >
          <p style={{ color: "#333", fontSize: "13px", margin: "4px 0" }}>
            Name：{pet.name}
          </p>
          <p style={{ color: "#333", fontSize: "13px", margin: "4px 0" }}>
            Species：{pet.species}
          </p>
          {pet.breed && (
            <p style={{ color: "#333", fontSize: "13px", margin: "4px 0" }}>
              Breed：{pet.breed}
            </p>
          )}
          {pet.gender && (
            <p style={{ color: "#333", fontSize: "13px", margin: "4px 0" }}>
              Gender：{pet.gender}
            </p>
          )}

          <p style={{ color: "#333", fontSize: "13px", margin: "4px 0" }}>
            Birthday：{new Date(pet.birthdate).toLocaleDateString()} · {age}{" "}
            years old
          </p>
          {pet.chip_number && (
            <p style={{ color: "#333", fontSize: "13px", margin: "4px 0" }}>
              晶片號碼：{pet.chip_number}
            </p>
          )}
          {pet.target_weight && (
            <p style={{ color: "#333", fontSize: "13px", margin: "4px 0" }}>
              目標體重：{pet.target_weight} kg
            </p>
          )}
        </div>

        {summary && (
          <div
            style={{
              background: "#111827",
              border: "1px solid #1f2937",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "24px",
            }}
          >
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                marginBottom: "12px",
                color: "white",
              }}
            >
              AI 健康摘要
            </h2>
            <p style={{ color: "#d1d5db", lineHeight: "1.8", margin: 0 }}>
              {summary}
            </p>
            <button
              onClick={() => setShowFull(!showFull)}
              style={{
                background: "transparent",
                color: "#9ca3af",
                border: "1px solid #374151",
                padding: "6px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                marginTop: "12px",
              }}
            >
              {showFull ? "收起報告" : "查看完整報告"}
            </button>

            {showFull && (
              <button
                onClick={handleDownloadPdf}
                style={{
                  background: "#4b5563",
                  color: "white",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  marginTop: "8px",
                  marginLeft: "8px",
                }}
              >
                下載 PDF
              </button>
            )}
            {showFull && (
              <p
                style={{ color: "#9ca3af", lineHeight: "2", marginTop: "12px" }}
              >
                {fullReport}
              </p>
            )}
          </div>
        )}

        {/*疫苗紀錄 */}
        {vaccineRecords.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ color: "#000" }}>疫苗紀錄</h3>
            {vaccineRecords.map((v) => (
              <div
                key={v.id}
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "6px 0",
                  fontSize: "13px",
                  color: "#333",
                }}
              >
                <strong>{v.vaccine_name}</strong> — {v.date.split("T")[0]}
                {v.next_due_date && ` · 下次：${v.next_due_date.split("T")[0]}`}
                {v.clinic && ` · ${v.clinic}`}
              </div>
            ))}
          </div>
        )}

        {/*醫療紀錄 */}
        {medicalRecords.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ color: "#000" }}>就醫紀錄</h3>
            {medicalRecords.map((m) => (
              <div
                key={m.id}
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "6px 0",
                  fontSize: "13px",
                  color: "#333",
                }}
              >
                <strong>{m.brief_name}</strong> — {m.date.split("T")[0]}
                {m.clinic && ` · ${m.clinic}`}
                {m.diagnosis && ` · 診斷：${m.diagnosis}`}
                {m.cost && ` · 費用：${m.cost} 元`}
              </div>
            ))}
          </div>
        )}
        {/* 必做事項完成率圓餅圖 */}

        {checklist.length > 0 &&
          (weightRecords.length > 0 ||
            medicalRecords.length > 0 ||
            vaccineRecords.length > 0) && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              {/* 一次性完成率 */}
              <div
                style={{
                  background: "#1f2937",
                  borderRadius: "10px",
                  padding: "16px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "13px",
                    color: "#9ca3af",
                    margin: "0 0 12px",
                  }}
                >
                  一次性完成率
                </p>
                <div style={{ height: "160px" }}>
                  <Pie
                    data={{
                      datasets: [
                        {
                          data: [
                            checklist.filter(
                              (i) => i.type === "one_time" && i.is_completed,
                            ).length,
                            checklist.filter(
                              (i) => i.type === "one_time" && !i.is_completed,
                            ).length,
                          ],
                          backgroundColor: ["#3dbfa0", "#374151"],
                          borderWidth: 0,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false },
                      },
                    }}
                  />
                </div>
                <p
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    margin: "12px 0 4px",
                    color: "black",
                  }}
                >
                  {Math.round(
                    (checklist.filter(
                      (i) => i.type === "one_time" && i.is_completed,
                    ).length /
                      checklist.filter((i) => i.type === "one_time").length) *
                      100,
                  )}
                  %
                </p>
                <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
                  {
                    checklist.filter(
                      (i) => i.type === "one_time" && i.is_completed,
                    ).length
                  }{" "}
                  / {checklist.filter((i) => i.type === "one_time").length} 完成
                </p>
              </div>

              {/* 今年定期完成率 */}
              <div
                style={{
                  background: "#1f2937",
                  borderRadius: "10px",
                  padding: "16px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "13px",
                    color: "#9ca3af",
                    margin: "0 0 12px",
                  }}
                >
                  今年定期完成率
                </p>
                <div style={{ height: "160px" }}>
                  <Pie
                    data={{
                      datasets: [
                        {
                          data: [
                            checklist.filter(
                              (i) =>
                                i.type === "annual" &&
                                i.completed_at &&
                                new Date(i.completed_at).getFullYear() ===
                                  new Date().getFullYear(),
                            ).length,
                            checklist.filter(
                              (i) =>
                                i.type === "annual" &&
                                !(
                                  i.completed_at &&
                                  new Date(i.completed_at).getFullYear() ===
                                    new Date().getFullYear()
                                ),
                            ).length,
                          ],
                          backgroundColor: ["#3dbfa0", "#374151"],
                          borderWidth: 0,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false },
                      },
                    }}
                  />
                </div>
                <p
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    margin: "12px 0 4px",
                    color: "black",
                  }}
                >
                  {Math.round(
                    (checklist.filter(
                      (i) =>
                        i.type === "annual" &&
                        i.completed_at &&
                        new Date(i.completed_at).getFullYear() ===
                          new Date().getFullYear(),
                    ).length /
                      checklist.filter((i) => i.type === "annual").length) *
                      100,
                  )}
                  %
                </p>
                <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
                  {
                    checklist.filter(
                      (i) =>
                        i.type === "annual" &&
                        i.completed_at &&
                        new Date(i.completed_at).getFullYear() ===
                          new Date().getFullYear(),
                    ).length
                  }{" "}
                  / {checklist.filter((i) => i.type === "annual").length} 完成
                </p>
              </div>
            </div>
          )}

        {/*體重趨勢圖 */}
        {weightRecords.length > 0 && (
          <div
            style={{
              background: "#111827",
              border: "1px solid #1f2937",
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                marginBottom: "16px",
                color: "white",
              }}
            >
              體重趨勢
            </h2>
            <div style={{ height: "250px" }}>
              <Line
                data={{
                  labels: weightRecords.map((w) => w.date.split("T")[0]),
                  datasets: [
                    {
                      label: "實際體重(kg)",
                      data: weightRecords.map((w) => w.weight),
                      borderColor: "rgb(75, 192, 192)",
                      tension: 0.1,
                    },
                    {
                      label: "目標體重(kg)",
                      data: weightRecords.map(() => pet.target_weight),
                      borderColor: "#FF2D2D",
                      tension: 0.1,
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    tooltip: {
                      callbacks: {
                        afterBody: (context) => {
                          if (context[0].datasetIndex !== 0) return "";
                          const actualWeight = context[0].parsed.y;
                          const targetWeight = pet.target_weight;
                          if (!targetWeight) return "";
                          const diff = parseFloat(
                            (actualWeight! - targetWeight).toFixed(1),
                          );
                          return diff > 0
                            ? `和目標體重相差 +${diff} kg（超重）`
                            : diff < 0
                              ? `和目標體重相差 ${diff} kg（未達目標）`
                              : `達成目標體重！`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
