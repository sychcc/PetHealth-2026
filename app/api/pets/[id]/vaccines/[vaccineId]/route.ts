import { NextRequest, NextResponse } from "next/server";
import { validatePetOwner, validateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; vaccineId: string }> },
) {
  const authResult = await validateUser();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }
  const { id, vaccineId } = await params;

  const petResult = await validatePetOwner(id, authResult.email);
  if ("error" in petResult) {
    return NextResponse.json(
      { error: petResult.error },
      { status: petResult.status },
    );
  }

  const vaccine = await prisma.vaccine.findUnique({
    where: { id: BigInt(vaccineId) },
  });
  if (!vaccine)
    return NextResponse.json({ error: "疫苗記錄不存在" }, { status: 404 });

  const {
    vaccine_name,
    date,
    next_due_date,
    clinic,
    vet_name,
    cost,
    photo_url,
  } = await req.json();

  const updated = await prisma.vaccine.update({
    where: { id: BigInt(vaccineId) },
    data: {
      vaccine_name,
      date: new Date(date),
      next_due_date: next_due_date ? new Date(next_due_date) : null,
      clinic,
      vet_name,
      cost,
      photo_url,
    },
  });

  return NextResponse.json({
    ...updated,
    id: String(updated.id),
    pet_id: String(updated.pet_id),
  });
}

export async function DELETE({
  params,
}: {
  params: Promise<{ id: string; vaccineId: string }>;
}) {
  const authResult = await validateUser();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }
  const { id, vaccineId } = await params;

  const petResult = await validatePetOwner(id, authResult.email);
  if ("error" in petResult) {
    return NextResponse.json(
      { error: petResult.error },
      { status: petResult.status },
    );
  }

  const vaccine = await prisma.vaccine.findUnique({
    where: { id: BigInt(vaccineId) },
  });
  if (!vaccine)
    return NextResponse.json({ error: "疫苗記錄不存在" }, { status: 404 });

  await prisma.vaccine.delete({ where: { id: BigInt(vaccineId) } });

  return NextResponse.json({ message: "刪除成功" });
}
