import { NextRequest, NextResponse } from "next/server";
import { validatePetOwner, validateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DOG_CHECKLIST = [
  { item_key: "microchip", label: "施打晶片", type: "one_time" },
  { item_key: "neutering", label: "絕育手術", type: "one_time" },
  { item_key: "core_vaccine_1", label: "五合一疫苗 第一劑", type: "one_time" },
  { item_key: "core_vaccine_2", label: "五合一疫苗 第二劑", type: "one_time" },
  { item_key: "core_vaccine_3", label: "五合一疫苗 第三劑", type: "one_time" },
  { item_key: "rabies_annual", label: "狂犬病疫苗", type: "annual" },
  { item_key: "core_vaccine_annual", label: "五合一疫苗補強", type: "annual" },
  { item_key: "deworming_annual", label: "驅蟲", type: "annual" },
  { item_key: "health_checkup_annual", label: "年度健康檢查", type: "annual" },
];

const CAT_CHECKLIST = [
  { item_key: "microchip", label: "施打晶片", type: "one_time" },
  { item_key: "neutering", label: "絕育手術", type: "one_time" },
  { item_key: "core_vaccine_1", label: "五合一疫苗 第一劑", type: "one_time" },
  { item_key: "core_vaccine_2", label: "五合一疫苗 第二劑", type: "one_time" },
  { item_key: "core_vaccine_3", label: "三合一疫苗補強", type: "one_time" },
  { item_key: "rabies_annual", label: "狂犬病疫苗", type: "annual" },
  { item_key: "core_vaccine_annual", label: "五合一疫苗補強", type: "annual" },
  { item_key: "triplecat_annual", label: "三合一疫苗補強", type: "annual" },
  { item_key: "deworming_annual", label: "驅蟲", type: "annual" },
  { item_key: "health_checkup_annual", label: "年度健康檢查", type: "annual" },
];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await validateUser();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }
  const { id } = await params;

  const petResult = await validatePetOwner(id, authResult.email);
  if ("error" in petResult) {
    return NextResponse.json(
      { error: petResult.error },
      { status: petResult.status },
    );
  }

  const checkItem = await prisma.petChecklistItem.findMany({
    where: { pet_id: BigInt(id) },
    orderBy: { id: "asc" },
  });

  return NextResponse.json(
    checkItem.map((i) => ({
      ...i,
      id: String(i.id),
      pet_id: String(i.pet_id),
    })),
  );
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await validateUser();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }
  const { id } = await params;
  const petResult = await validatePetOwner(id, authResult.email);
  if ("error" in petResult) {
    return NextResponse.json(
      { error: petResult.error },
      { status: petResult.status },
    );
  }
  const { pet } = petResult;

  // 已經有 checklist 就不重複建立
  const existing = await prisma.petChecklistItem.count({
    where: { pet_id: BigInt(id) },
  });
  if (existing > 0)
    return NextResponse.json({ message: "已存在" }, { status: 200 });

  // 根據 species 決定要用哪個清單
  const template = pet.species === "Cat" ? CAT_CHECKLIST : DOG_CHECKLIST;
  // 一次建立多筆
  await prisma.petChecklistItem.createMany({
    data: template.map((item) => ({ ...item, pet_id: BigInt(id) })),
  });
  return NextResponse.json({ message: "建立成功" }, { status: 201 });
}
