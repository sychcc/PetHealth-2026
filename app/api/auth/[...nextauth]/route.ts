import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export const authOptions: NextAuthOptions = {
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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user || !user.password) return null
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null
        return { id: String(user.id), name: user.name, email: user.email }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
  },
  //google登入的帳號會新增user到資料庫
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })
        if (!existingUser) {
          await prisma.user.create({
            data: {
              name: user.name!,
              email: user.email!,
              provider: "google",
            },
          })
        }
      }
      return true
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }