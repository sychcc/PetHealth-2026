import { NextRequest, NextResponse } from "next/server";
import { validatePetOwner, validateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; weightId: string }> },
) {
  const authResult = await validateUser();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }
  const { id, weightId } = await params;

  const petResult = await validatePetOwner(id, authResult.email);
  if ("error" in petResult) {
    return NextResponse.json(
      { error: petResult.error },
      { status: petResult.status },
    );
  }

  const weight_record = await prisma.weightRecord.findUnique({
    where: { id: BigInt(weightId) },
  });
  if (!weight_record)
    return NextResponse.json({ error: "體重記錄不存在" }, { status: 404 });

  const { weight, date, notes } = await req.json();

  const updated = await prisma.weightRecord.update({
    where: { id: BigInt(weightId) },
    data: {
      pet_id: BigInt(id),
      weight,
      date: new Date(date),
      notes: notes || null,
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
  params: Promise<{ id: string; weightId: string }>;
}) {
  const authResult = await validateUser();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }
  const { id, weightId } = await params;

  const petResult = await validatePetOwner(id, authResult.email);
  if ("error" in petResult) {
    return NextResponse.json(
      { error: petResult.error },
      { status: petResult.status },
    );
  }

  const weight_record = await prisma.weightRecord.findUnique({
    where: { id: BigInt(weightId) },
  });
  if (!weight_record)
    return NextResponse.json({ error: "體重記錄不存在" }, { status: 404 });

  await prisma.weightRecord.delete({ where: { id: BigInt(weightId) } });

  return NextResponse.json({ message: "刪除成功" });
}
