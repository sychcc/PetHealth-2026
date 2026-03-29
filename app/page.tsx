"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "white",
        minHeight: "100vh",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:ital,wght@0,300;0,600;1,600&display=swap');`}</style>

      {/* HERO */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "80px 48px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "64px",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#f0fafa",
              border: "1px solid #e0f5f4",
              borderRadius: "99px",
              padding: "5px 12px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#0E7C86",
              }}
            ></div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
                color: "#0E7C86",
              }}
            >
              Pet health tracking
            </span>
          </div>
          <h1
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: "56px",
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#0f2423",
              marginBottom: "20px",
            }}
          >
            Remember the things
            <br />
            that are easy to{" "}
            <em style={{ fontStyle: "italic", color: "#0E7C86" }}>forget</em>
          </h1>
          <p
            style={{
              fontSize: "17px",
              color: "#4a6968",
              lineHeight: 1.7,
              fontWeight: 300,
              marginBottom: "36px",
              maxWidth: "440px",
            }}
          >
            When was the last vaccine? Has the weight changed? What did the vet
            say last time? PetHealth keeps track of all of it ! :)
          </p>
          <div style={{ display: "flex", gap: "12px" }}>
            <Link
              href={session ? "/pets" : "/auth/signup"}
              style={{
                padding: "14px 28px",
                borderRadius: "10px",
                background: "#0E7C86",
                color: "white",
                textDecoration: "none",
                fontSize: "15px",
                fontWeight: 600,
                boxShadow: "0 4px 20px rgba(14,124,134,0.3)",
              }}
            >
              {session ? "My Pets →" : "Start tracking →"}
            </Link>
            {!session && (
              <Link
                href="/auth/signin"
                style={{
                  padding: "14px 28px",
                  borderRadius: "10px",
                  background: "transparent",
                  color: "#2d4a49",
                  textDecoration: "none",
                  fontSize: "15px",
                  fontWeight: 500,
                  border: "1.5px solid #e4eaeb",
                }}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>

        {/* HERO CARD */}
        <div
          style={{
            background: "white",
            border: "1px solid #e4eaeb",
            borderRadius: "20px",
            padding: "28px",
            boxShadow: "0 12px 40px rgba(14,91,83,0.14)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "#f0fafa",
                border: "1px solid #e0f5f4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
              }}
            >
              🐶
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "Fraunces, serif",
                  fontSize: "22px",
                  fontWeight: 600,
                  color: "#0f2423",
                }}
              >
                Money
              </div>
              <div style={{ fontSize: "13px", color: "#4a6968" }}>
                Jack Russell · 8 years old
              </div>
            </div>
            <div
              style={{
                padding: "4px 10px",
                borderRadius: "99px",
                background: "#e6f9f0",
                color: "#1a7a4a",
                fontSize: "11px",
                fontWeight: 600,
                border: "1px solid #b3edd0",
              }}
            >
              Healthy
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            {[
              ["5.9 kg", "Current weight"],
              ["5/5", "One-time tasks"],
              ["3", "Vaccines logged"],
              ["75%", "Health score"],
            ].map(([val, lbl]) => (
              <div
                key={lbl}
                style={{
                  background: "#F1F4F4",
                  borderRadius: "12px",
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 600,
                    color: "#0f2423",
                  }}
                >
                  {val}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#4a6968",
                    marginTop: "3px",
                  }}
                >
                  {lbl}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              background: "#0a3d3a",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#2ec4ba",
                }}
              ></div>
              <span
                style={{ fontSize: "12px", fontWeight: 600, color: "white" }}
              >
                AI Health Analysis
              </span>
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.6,
              }}
            >
              Money has been losing weight steadily this month — almost at the
              target!! Don't forget the deworming this week!
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div
        style={{
          background: "#f0fafa",
          borderTop: "1px solid #e0f5f4",
          borderBottom: "1px solid #e0f5f4",
          padding: "40px 48px",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "32px",
          }}
        >
          {[
            ["Vaccines", "Auto reminders when due"],
            ["Weight", "Visual trend charts"],
            ["AI", "Instant health Q&A"],
            ["Email", "Appointment notifications"],
          ].map(([num, lbl]) => (
            <div key={lbl} style={{ textAlign: "center" as const }}>
              <div
                style={{
                  fontFamily: "Fraunces, serif",
                  fontSize: "28px",
                  fontWeight: 600,
                  color: "#0e5c57",
                  lineHeight: 1,
                }}
              >
                {num}
              </div>
              <div
                style={{ fontSize: "13px", color: "#4a6968", marginTop: "6px" }}
              >
                {lbl}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 48px" }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
            color: "#0E7C86",
            marginBottom: "12px",
          }}
        >
          Features
        </div>
        <h2
          style={{
            fontFamily: "Fraunces, serif",
            fontSize: "44px",
            fontWeight: 600,
            color: "#0f2423",
            marginBottom: "16px",
          }}
        >
          Everything you need, in one place
        </h2>
        <p
          style={{
            fontSize: "17px",
            color: "#4a6968",
            fontWeight: 300,
            maxWidth: "520px",
            lineHeight: 1.7,
            marginBottom: "48px",
          }}
        >
          All the tools you need to stay on top of your pet's health
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1px",
            background: "#e4eaeb",
            border: "1px solid #e4eaeb",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          {[
            ["疫苗記錄", "打過哪些疫苗、什麼時候該補打，全部記在這裡~"],
            ["體重追蹤", "定期記錄體重，看看趨勢有沒有朝對的方向走!"],
            ["就醫紀錄", "每次看診發生了什麼，趕快寫下來，不然會忘記！"],
            ["健康清單", "毛小孩該做的事項列表，一項一項打勾確認"],
            [
              "問 AI助理",
              "不確定某件事正不正常？直接用你的語言問，AI 會看你寵物的實際資料再回答～",
            ],
            ["Email 提醒", "疫苗到期或就醫預約當天，自動寄 Email 通知你。"],
          ].map(([title, desc]) => (
            <div
              key={title as string}
              style={{ background: "white", padding: "32px" }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#0f2423",
                  marginBottom: "8px",
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "#4a6968",
                  lineHeight: 1.65,
                  fontWeight: 300,
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "0 48px 80px" }}>
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            background: "#0a3d3a",
            borderRadius: "24px",
            padding: "72px 64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "48px",
            flexWrap: "wrap" as const,
          }}
        >
          <h2
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: "44px",
              fontWeight: 600,
              color: "white",
              lineHeight: 1.15,
              maxWidth: "480px",
            }}
          >
            Your pet deserves to be{" "}
            <em style={{ fontStyle: "italic", color: "#2ec4ba" }}>
              taken care of
            </em>{" "}
            properly
          </h2>
          <Link
            href="/auth/signup"
            style={{
              padding: "16px 32px",
              borderRadius: "10px",
              background: "white",
              color: "#0e5c57",
              fontSize: "15px",
              fontWeight: 600,
              textDecoration: "none",
              whiteSpace: "nowrap" as const,
            }}
          >
            Create your account →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          padding: "24px 48px",
          borderTop: "1px solid #e4eaeb",
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap" as const,
          gap: "8px",
        }}
      >
        <p style={{ fontSize: "13px", color: "#4a6968" }}>© 2026 PetHealth</p>
      </footer>
    </div>
  );
}
