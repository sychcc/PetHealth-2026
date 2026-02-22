import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; vaccineId: string }> }
) {
  const { id, vaccineId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未登入" }, { status: 401 })
  }

  const pet = await prisma.pet.findUnique({ where: { id: BigInt(id) } })
  if (!pet) return NextResponse.json({ error: "寵物不存在" }, { status: 404 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (pet.user_id !== user!.id) return NextResponse.json({ error: "無權限" }, { status: 403 })

  const vaccine = await prisma.vaccine.findUnique({ where: { id: BigInt(vaccineId) } })
  if (!vaccine) return NextResponse.json({ error: "疫苗記錄不存在" }, { status: 404 })

  const { vaccine_name, date, next_due_date, clinic, vet_name, photo_url } = await req.json()

  const updated = await prisma.vaccine.update({
    where: { id: BigInt(vaccineId) },
    data: {
      vaccine_name,
      date: new Date(date),
      next_due_date: next_due_date ? new Date(next_due_date) : null,
      clinic,
      vet_name,
      photo_url,
    },
  })

  return NextResponse.json(
    { ...updated, id: String(updated.id), pet_id: String(updated.pet_id) }
  )
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; vaccineId: string }> }
) {
  const { id, vaccineId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未登入" }, { status: 401 })
  }

  const pet = await prisma.pet.findUnique({ where: { id: BigInt(id) } })
  if (!pet) return NextResponse.json({ error: "寵物不存在" }, { status: 404 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (pet.user_id !== user!.id) return NextResponse.json({ error: "無權限" }, { status: 403 })

  const vaccine = await prisma.vaccine.findUnique({ where: { id: BigInt(vaccineId) } })
  if (!vaccine) return NextResponse.json({ error: "疫苗記錄不存在" }, { status: 404 })

  await prisma.vaccine.delete({ where: { id: BigInt(vaccineId) } })

  return NextResponse.json({ message: "刪除成功" })
}