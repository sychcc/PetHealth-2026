"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
    } else {
      router.push("/auth/signin")
    }
  }

  // return (
  //   <div>
  //     <h1>Sign up for a new account!</h1>
  //     <form onSubmit={handleSubmit}>
  //       <input
  //         type="text"
  //         placeholder="Your name"
  //         value={name}
  //         onChange={(e) => setName(e.target.value)}
  //       />
  //       <input
  //         type="email"
  //         placeholder="Email"
  //         value={email}
  //         onChange={(e) => setEmail(e.target.value)}
  //       />
  //       <input
  //         type="password"
  //         placeholder="Password"
  //         value={password}
  //         onChange={(e) => setPassword(e.target.value)}
  //       />
  //       {error && <p>{error}</p>}
  //       <button type="submit">Sign Up</button>
  //     </form>
  //   </div>
  // )
  return (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", minHeight: "80vh", padding: "24px"
  }}>
    <div style={{
      background: "#111827", border: "1px solid #1f2937",
      borderRadius: "12px", padding: "40px", width: "100%", maxWidth: "360px"
    }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px", textAlign: "center" }}>建立帳號</h1>
      <p style={{ color: "#9ca3af", fontSize: "14px", textAlign: "center", marginBottom: "24px" }}>開始記錄你的寵物健康</p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input
          type="text" placeholder="Your name" value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #374151", background: "#1f2937", color: "white", fontSize: "14px" }}
        />
        <input
          type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #374151", background: "#1f2937", color: "white", fontSize: "14px" }}
        />
        <input
          type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #374151", background: "#1f2937", color: "white", fontSize: "14px" }}
        />
        {error && <p style={{ color: "#ef4444", fontSize: "14px", margin: 0 }}>{error}</p>}
        <button type="submit" style={{
          background: "#4b5563", color: "white", padding: "10px",
          borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "14px"
        }}>Sign Up</button>
      </form>

      <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "14px", marginTop: "16px" }}>
        已有帳號？{" "}
        <a href="/auth/signin" style={{ color: "#d1d5db", textDecoration: "underline" }}>登入</a>
      </p>
    </div>
  </div>
)
  
}