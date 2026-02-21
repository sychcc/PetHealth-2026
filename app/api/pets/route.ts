import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET /api/pets - 取得我的寵物列表
export async function GET() {
    //先判斷有沒有登入
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未登入" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  console.log("session:", session)  // 加這行

  const pets = await prisma.pet.findMany({
    where: { user_id: user!.id },
  })

  return NextResponse.json( pets.map((pet) => ({ ...pet, id: String(pet.id), user_id: String(pet.user_id) })))
}

// POST /api/pets - 新增寵物
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  console.log("session:", session)  // 加這行
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未登入" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  const { name, species, birthdate, chip_number, photo_url } = await req.json()

  if (!name || !species || !birthdate) {
    return NextResponse.json({ error: "名稱、品種、生日為必填" }, { status: 400 })
  }

  const pet = await prisma.pet.create({
    data: {
      user_id: user!.id,
      name,
      species,
      birthdate: new Date(birthdate),
      chip_number,
      photo_url,
    },
  })

  return NextResponse.json({ ...pet, id: String(pet.id), user_id: String(pet.user_id) }, { status: 201 })
}