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
  const weight_record = await prisma.weightRecord.findMany({
    where: { pet_id: BigInt(id) },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(
    weight_record.map((w) => ({
      ...w,
      id: String(w.id),
      pet_id: String(w.pet_id),
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

  const { weight, date, notes } = await req.json();

  if (weight == null || weight == 0 || weight == undefined || !date) {
    return NextResponse.json(
      { error: "體重、測量日期為必填" },
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
  const weight_record = await prisma.weightRecord.create({
    data: {
      pet_id: BigInt(id),
      weight,
      date: new Date(date),
      notes: notes || null,
    },
  });

  return NextResponse.json(
    {
      ...weight_record,
      id: String(weight_record.id),
      pet_id: String(weight_record.pet_id),
    },
    { status: 201 },
  );
}
