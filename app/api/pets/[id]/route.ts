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

  const pet = await prisma.pet.findUnique({
    where: { id: BigInt(id) },
  })

  if (!pet) {
    return NextResponse.json({ error: "寵物不存在" }, { status: 404 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (pet.user_id !== user!.id) {
    return NextResponse.json({ error: "無權限" }, { status: 403 })
  }

  return NextResponse.json({ ...pet, id: String(pet.id), user_id: String(pet.user_id) })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未登入" }, { status: 401 })
  }

  const pet = await prisma.pet.findUnique({
    where: { id: BigInt(id) },
  })

  if (!pet) {
    return NextResponse.json({ error: "寵物不存在" }, { status: 404 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (pet.user_id !== user!.id) {
    return NextResponse.json({ error: "無權限" }, { status: 403 })
  }

  const { name, species,breed,target_weight, birthdate, chip_number, photo_url } = await req.json()

  const updated = await prisma.pet.update({
    where: { id: BigInt(id) },
    data: { name, species,breed, birthdate: new Date(birthdate), chip_number, target_weight,photo_url },
  })

  return NextResponse.json({ ...updated, id: String(updated.id), user_id: String(updated.user_id) })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未登入" }, { status: 401 })
  }

  const pet = await prisma.pet.findUnique({
    where: { id: BigInt(id) },
  })

  if (!pet) {
    return NextResponse.json({ error: "寵物不存在" }, { status: 404 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (pet.user_id !== user!.id) {
    return NextResponse.json({ error: "無權限" }, { status: 403 })
  }
  await prisma.weightRecord.deleteMany({ where: { pet_id: BigInt(id) } })
  await prisma.vaccine.deleteMany({ where: { pet_id: BigInt(id) } })
  await prisma.medicalRecord.deleteMany({ where: { pet_id: BigInt(id) } })
  await prisma.reminder.deleteMany({ where: { pet_id: BigInt(id) } })
  await prisma.aiAnalysis.deleteMany({ where: { pet_id: BigInt(id) } })
  await prisma.petChecklistItem.deleteMany({ where: { pet_id: BigInt(id) } })

  await prisma.pet.delete({
    where: { id: BigInt(id) },
  })

  return NextResponse.json({ message: "刪除成功" })
}