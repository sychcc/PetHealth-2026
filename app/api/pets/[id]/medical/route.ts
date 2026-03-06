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

  const medicalRecord = await prisma.medicalRecord.findMany({
    where: { pet_id: BigInt(id) },
    orderBy: { date: "desc" },
  })

  return NextResponse.json(
    medicalRecord.map((m) => ({ ...m, id: String(m.id), pet_id: String(m.pet_id) }))
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

  const { date,brief_name, clinic, symptoms,diagnosis,prescription,cost, photo_url } = await req.json()

  if (!date||!brief_name) {
    return NextResponse.json({ error: "就診日期和原因為必填" }, { status: 400 })
  }

  const medical = await prisma.medicalRecord.create({
    data: {
      pet_id: BigInt(id),
      date: new Date(date),
      brief_name:brief_name,
      clinic:clinic||null,
      symptoms:symptoms||null,
      diagnosis:diagnosis||null,
      prescription:prescription||null,
      cost:cost||null,
      photo_url:photo_url||null,
    },
  })

  return NextResponse.json(
    { ...medical, id: String(medical.id), pet_id: String(medical.pet_id) },
    { status: 201 }
  )
}