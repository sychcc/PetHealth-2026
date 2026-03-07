"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"

export default function Header() {
  const { data: session } = useSession()

  return (
    <header style={{
      background: "#111827",
      borderBottom: "1px solid #1f2937",
      padding: "12px 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <Link href="/" style={{ textDecoration: "none" }}>
        <span style={{ fontSize: "18px", fontWeight: "bold", color: "white" }}>🐾 PetHealth</span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {session ? (
          <>
            <span style={{ color: "#9ca3af", fontSize: "14px" }}>{session.user?.name}</span>
            <Link href="/pets" style={{ color: "#d1d5db", textDecoration: "none", fontSize: "14px" }}>My Pets</Link>
            <Link href="/api/auth/signout" style={{ background: "#374151", color: "white", padding: "6px 14px", borderRadius: "6px", textDecoration: "none", fontSize: "14px" }}>
  Sign Out
</Link>
          </>
        ) : (
          <Link href="/auth/signin" style={{ color: "#d1d5db", textDecoration: "none" }}>Sign In</Link>
        )}
      </div>
    </header>
  )
}