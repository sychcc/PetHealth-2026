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

  return (
    <div>
      <h1>Welcome Back</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="e.g. aaa@bbb.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p>{error}</p>}
        <button type="submit">Sign In</button>
      </form>
      <button onClick={handleGoogle}>Google</button>
    </div>
  )
}