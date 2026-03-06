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

  const weight_record = await prisma.weightRecord.findMany({
    where: { pet_id: BigInt(id) },
    orderBy: { date: "desc" },
  })

  return NextResponse.json(
    weight_record.map((w) => ({ ...w, id: String(w.id), pet_id: String(w.pet_id) }))
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

  const { weight, date, notes } = await req.json()

  if (weight==null ||weight==0||weight==undefined|| !date) {
    return NextResponse.json({ error: "體重、測量日期為必填" }, { status: 400 })
  }

  const weight_record = await prisma.weightRecord.create({
    data: {
      pet_id: BigInt(id),
      weight,
      date: new Date(date),
      notes: notes || null,
    },
  })

  return NextResponse.json(
    { ...weight_record, id: String(weight_record.id), pet_id: String(weight_record.pet_id) },
    { status: 201 }
  )
}