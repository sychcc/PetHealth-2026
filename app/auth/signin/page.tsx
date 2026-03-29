"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const css = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:ital,wght@0,300;0,600;1,600&display=swap');
input { outline: none; }
input:focus { border-color: #0E7C86 !important; }
`;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      setError("Wrong email or password");
    } else {
      window.location.href = "/pets";
    }
  }

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#F1F4F4",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <style>{css}</style>

      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Link
            href="/"
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: "22px",
              fontWeight: 600,
              color: "#0e5c57",
              textDecoration: "none",
            }}
          >
            🐾 PetHealth
          </Link>
          <div
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: "28px",
              fontWeight: 600,
              color: "#0f2423",
              marginTop: "24px",
            }}
          >
            Welcome back
          </div>
          <div style={{ fontSize: "14px", color: "#4a6968", marginTop: "6px" }}>
            Sign in to your account
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "16px",
            border: "1px solid #e4eaeb",
            padding: "32px",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            <div>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#4a6968",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1.5px solid #e4eaeb",
                  background: "white",
                  fontSize: "14px",
                  color: "#0f2423",
                  boxSizing: "border-box" as const,
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#4a6968",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1.5px solid #e4eaeb",
                  background: "white",
                  fontSize: "14px",
                  color: "#0f2423",
                  boxSizing: "border-box" as const,
                }}
              />
            </div>
            {error && (
              <p style={{ color: "#c0392b", fontSize: "13px", margin: 0 }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: "10px",
                background: "#0E7C86",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
                marginTop: "4px",
              }}
            >
              Sign In
            </button>
          </form>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "20px 0",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#e4eaeb" }} />
            <span style={{ color: "#4a6968", fontSize: "12px" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "#e4eaeb" }} />
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: "10px",
              background: "white",
              color: "#2d4a49",
              border: "1.5px solid #e4eaeb",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span>G</span> Continue with Google
          </button>
        </div>

        <p
          style={{
            textAlign: "center",
            color: "#4a6968",
            fontSize: "14px",
            marginTop: "20px",
          }}
        >
          Don't have an account?{" "}
          <Link
            href="/auth/signup"
            style={{
              color: "#0E7C86",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
