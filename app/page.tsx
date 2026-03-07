"use client"
import { getServerSession } from "next-auth"
import { useSession } from "next-auth/react"
import Link from "next/link"

// export default async function Home() {
//   const session = await getServerSession()

//   return (
//     <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
//       <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>PetHealth 寵物健康記錄</h1>
//       {session ? (
//         <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
//           <p>Welcome ! {session.user?.name}</p>
//           <Link href="/pets" >My Pets</Link>
//           <Link href="/api/auth/signout">Sign Out</Link>
//         </div>
//       ) : (
//         <div>
//           <Link href="/auth/signin">登入</Link>
//           <Link href="/auth/signup">註冊</Link>
//         </div>
//       )}
//     </div>
//   )
// }

export default function HomePage() {
  const { data: session } = useSession()

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "80vh",
      textAlign: "center",
      padding: "24px",
    }}>
      <div style={{ fontSize: "64px", marginBottom: "16px" }}>🐾</div>
      <h1 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "12px" }}>PetHealth 寵物健康記錄</h1>
      <p style={{ color: "#9ca3af", fontSize: "16px", marginBottom: "32px" }}>
        記錄你的毛小孩健康狀況、疫苗、體重與就醫歷史
      </p>
      {session ? (
        <Link href="/pets" style={{
          background: "#4b5563", color: "white",
          padding: "12px 32px", borderRadius: "8px",
          textDecoration: "none", fontSize: "16px"
        }}>
          查看我的寵物 →
        </Link>
      ) : (
        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/auth/signin" style={{
            background: "#4b5563", color: "white",
            padding: "12px 32px", borderRadius: "8px",
            textDecoration: "none", fontSize: "16px"
          }}>登入</Link>
          <Link href="/auth/signup" style={{
            background: "#1f2937", color: "white",
            padding: "12px 32px", borderRadius: "8px",
            textDecoration: "none", fontSize: "16px",
            border: "1px solid #374151"
          }}>註冊</Link>
        </div>
      )}
    </div>
  )
}