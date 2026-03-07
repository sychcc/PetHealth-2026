"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Wrong email or wrong password")
    } else {
      router.push("/pets")
    }
  }

  function handleGoogle() {
    //登入完後轉回首頁
    signIn("google",{callbackUrl:'/'})
  }

  // return (
  //   <div>
  //     <h1>Welcome Back</h1>
  //     <form onSubmit={handleSubmit}>
  //       <input
  //         type="email"
  //         placeholder="e.g. aaa@bbb.com"
  //         value={email}
  //         onChange={(e) => setEmail(e.target.value)}
  //       />
  //       <input
  //         type="password"
  //         placeholder="password"
  //         value={password}
  //         onChange={(e) => setPassword(e.target.value)}
  //       />
  //       {error && <p>{error}</p>}
  //       <button type="submit">Sign In</button>
  //     </form>
  //     <button onClick={handleGoogle}>Google</button>
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
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px", textAlign: "center" }}>Welcome Back</h1>
      <p style={{ color: "#9ca3af", fontSize: "14px", textAlign: "center", marginBottom: "24px" }}>登入你的帳號</p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
        }}>Sign In</button>
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "16px 0" }}>
        <div style={{ flex: 1, height: "1px", background: "#374151" }} />
        <span style={{ color: "#6b7280", fontSize: "12px" }}>or</span>
        <div style={{ flex: 1, height: "1px", background: "#374151" }} />
      </div>

      <button onClick={handleGoogle} style={{
        width: "100%", background: "#1f2937", color: "white", padding: "10px",
        borderRadius: "8px", border: "1px solid #374151", cursor: "pointer", fontSize: "14px"
      }}>
        Continue with Google
      </button>

      <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "14px", marginTop: "16px" }}>
        還沒有帳號？{" "}
        <a href="/auth/signup" style={{ color: "#d1d5db", textDecoration: "underline" }}>註冊</a>
      </p>
    </div>
  </div>
)
}