import { getServerSession } from "next-auth"
import Link from "next/link"

export default async function Home() {
  const session = await getServerSession()

  return (
    <div>
      <h1>PetHealth 寵物健康記錄</h1>
      {session ? (
        <div>
          <p>歡迎，{session.user?.name}</p>
          <Link href="/pets">我的寵物</Link>
          <Link href="/api/auth/signout">登出</Link>
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