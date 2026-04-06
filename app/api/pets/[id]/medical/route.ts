import { NextRequest, NextResponse } from "next/server";
import { validatePetOwner, validateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  const medicalRecord = await prisma.medicalRecord.findMany({
    where: { pet_id: BigInt(id) },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(
    medicalRecord.map((m) => ({
      ...m,
      id: String(m.id),
      pet_id: String(m.pet_id),
    })),
  );
}

export async function POST(
  req: NextRequest,
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

  if (!date || !brief_name) {
    return NextResponse.json(
      { error: "就診日期和原因為必填" },
      { status: 400 },
    );
  }
  const petResult = await validatePetOwner(id, authResult.email);
  if ("error" in petResult) {
    return NextResponse.json(
      { error: petResult.error },
      { status: petResult.status },
    );
  }
  const medical = await prisma.medicalRecord.create({
    data: {
      pet_id: BigInt(id),
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

  return NextResponse.json(
    { ...medical, id: String(medical.id), pet_id: String(medical.pet_id) },
    { status: 201 },
  );
}
