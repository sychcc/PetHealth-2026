import { NextRequest, NextResponse } from "next/server";
import { validatePetOwner, validateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; medicalId: string }> },
) {
  const authResult = await validateUser();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }
  const { id, medicalId } = await params;

  const petResult = await validatePetOwner(id, authResult.email);
  if ("error" in petResult) {
    return NextResponse.json(
      { error: petResult.error },
      { status: petResult.status },
    );
  }

  const medical_record = await prisma.medicalRecord.findUnique({
    where: { id: BigInt(medicalId) },
  });
  if (!medical_record)
    return NextResponse.json({ error: "醫療記錄不存在" }, { status: 404 });

  const {
    date,
    brief_name,
    clinic,
    symptoms,
    diagnosis,
    prescription,
    cost,
    photo_url,
  } = await req.json();

  const updated = await prisma.medicalRecord.update({
    where: { id: BigInt(medicalId) },
    data: {
      date: new Date(date),
      brief_name: brief_name,
      clinic: clinic || null,
      symptoms: symptoms || null,
      diagnosis: diagnosis || null,
      prescription: prescription || null,
      cost: cost || null,
      photo_url: photo_url || null,
    },
  });

  return NextResponse.json({
    ...updated,
    id: String(updated.id),
    pet_id: String(updated.pet_id),
  });
}

export async function DELETE(
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string; medicalId: string }>;
  },
) {
  const authResult = await validateUser();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }
  const { id, medicalId } = await params;

  const petResult = await validatePetOwner(id, authResult.email);
  if ("error" in petResult) {
    return NextResponse.json(
      { error: petResult.error },
      { status: petResult.status },
    );
  }

  const medical_record = await prisma.medicalRecord.findUnique({
    where: { id: BigInt(medicalId) },
  });
  if (!medical_record)
    return NextResponse.json({ error: "醫療記錄不存在" }, { status: 404 });

  await prisma.medicalRecord.delete({ where: { id: BigInt(medicalId) } });

  return NextResponse.json({ message: "刪除成功" });
}
