import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateUser } from "@/lib/auth";

// GET /api/pets - 取得我的寵物列表
export async function GET() {
  const authResult = await validateUser();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  //有登入 拿pets
  //validateUser() 回傳 email 用email查user再用user_id查pets
  const user = await prisma.user.findUnique({
    where: { email: authResult.email },
  });
  if (!user)
    return NextResponse.json({ error: "使用者不存在" }, { status: 401 });

  const pets = await prisma.pet.findMany({
    where: { user_id: user.id },
  });

  return NextResponse.json(
    pets.map((pet) => ({
      ...pet,
      id: String(pet.id),
      user_id: String(pet.user_id),
    })),
  );
}

// POST /api/pets - 新增寵物
export async function POST(req: NextRequest) {
  const authResult = await validateUser();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }
  //有登入
  //先驗證欄位有沒有正確，正確才去資料庫查user => Fail Fast
  const { name, breed, gender, species, birthdate, chip_number, photo_url } =
    await req.json();

  if (!name || !species || !birthdate) {
    return NextResponse.json(
      { error: "名稱、品種、生日為必填" },
      { status: 400 },
    );
  }
  const user = await prisma.user.findUnique({
    where: { email: authResult.email },
  });
  if (!user)
    return NextResponse.json({ error: "使用者不存在" }, { status: 401 });

  //限制寵物數量，不能超過10隻
  const petCount = await prisma.pet.count({
    where: { user_id: user.id },
  });
  if (petCount >= 10) {
    return NextResponse.json({ error: "最多只能新增10隻寵物" });
  }

  const pet = await prisma.pet.create({
    data: {
      user_id: user.id,
      name,
      breed,
      gender,
      species,
      birthdate: new Date(birthdate),
      chip_number,
      photo_url,
    },
  });

  return NextResponse.json(
    { ...pet, id: String(pet.id), user_id: String(pet.user_id) },
    { status: 201 },
  );
}
