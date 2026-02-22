import { getServerSession } from "next-auth"
import Link from "next/link"

export default async function Home() {
  const session = await getServerSession()

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>PetHealth 寵物健康記錄</h1>
      {session ? (
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <p>Welcome ! {session.user?.name}</p>
          <Link href="/pets" >My Pets</Link>
          <Link href="/api/auth/signout">Sign Out</Link>
        </div>
      ) : (
        <div>
          <Link href="/auth/signin">登入</Link>
          <Link href="/auth/signup">註冊</Link>
        </div>
      )}
    </div>
  )
}