import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; medicalId: string }> }
) {
  const { id, medicalId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未登入" }, { status: 401 })
  }

  const pet = await prisma.pet.findUnique({ where: { id: BigInt(id) } })
  if (!pet) return NextResponse.json({ error: "寵物不存在" }, { status: 404 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (pet.user_id !== user!.id) return NextResponse.json({ error: "無權限" }, { status: 403 })

  const medical_record = await prisma.medicalRecord.findUnique({ where: { id: BigInt(medicalId) } })
  if (!medical_record) return NextResponse.json({ error: "醫療記錄不存在" }, { status: 404 })

  const { date, brief_name,clinic, symptoms,diagnosis,prescription,cost, photo_url } = await req.json()

  const updated = await prisma.medicalRecord.update({
    where: { id: BigInt(medicalId) },
    data: {
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
    { ...updated, id: String(updated.id), pet_id: String(updated.pet_id) }
  )
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; medicalId: string }> }
) {
  const { id, medicalId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未登入" }, { status: 401 })
  }

  const pet = await prisma.pet.findUnique({ where: { id: BigInt(id) } })
  if (!pet) return NextResponse.json({ error: "寵物不存在" }, { status: 404 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (pet.user_id !== user!.id) return NextResponse.json({ error: "無權限" }, { status: 403 })

  const medical_record = await prisma.medicalRecord.findUnique({ where: { id: BigInt(medicalId) } })
  if (!medical_record) return NextResponse.json({ error: "醫療記錄不存在" }, { status: 404 })

  await prisma.medicalRecord.delete({ where: { id: BigInt(medicalId) } })

  return NextResponse.json({ message: "刪除成功" })
}