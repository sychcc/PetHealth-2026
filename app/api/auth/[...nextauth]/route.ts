import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import bcrypt from 'bcrypt'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
         if (!credentials?.email || !credentials?.password) return null
        // 查資料庫有沒有這個 email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        // 沒有這個 user 或沒有密碼（Google 登入的用戶）就回傳 null
        if (!user || !user.password) return null
        // 比對密碼
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null
        // 正確就回傳 user
        return { id: String(user.id), name: user.name, email: user.email }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
  },
})

export { handler as GET, handler as POST }