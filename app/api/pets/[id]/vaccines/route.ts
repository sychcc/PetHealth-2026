import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未登入" }, { status: 401 })
  }

  const pet = await prisma.pet.findUnique({ where: { id: BigInt(id) } })
  if (!pet) return NextResponse.json({ error: "寵物不存在" }, { status: 404 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (pet.user_id !== user!.id) return NextResponse.json({ error: "無權限" }, { status: 403 })

  const vaccines = await prisma.vaccine.findMany({
    where: { pet_id: BigInt(id) },
    orderBy: { date: "desc" },
  })

  return NextResponse.json(
    vaccines.map((v) => ({ ...v, id: String(v.id), pet_id: String(v.pet_id) }))
  )
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未登入" }, { status: 401 })
  }

  const pet = await prisma.pet.findUnique({ where: { id: BigInt(id) } })
  if (!pet) return NextResponse.json({ error: "寵物不存在" }, { status: 404 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (pet.user_id !== user!.id) return NextResponse.json({ error: "無權限" }, { status: 403 })

  const { vaccine_name, date, next_due_date, clinic, vet_name, photo_url } = await req.json()

  if (!vaccine_name || !date) {
    return NextResponse.json({ error: "疫苗名稱、接種日期為必填" }, { status: 400 })
  }

  const vaccine = await prisma.vaccine.create({
    data: {
      pet_id: BigInt(id),
      vaccine_name,
      date: new Date(date),
      next_due_date: next_due_date ? new Date(next_due_date) : null,
      clinic,
      vet_name,
      photo_url,
    },
  })

  return NextResponse.json(
    { ...vaccine, id: String(vaccine.id), pet_id: String(vaccine.pet_id) },
    { status: 201 }
  )
}