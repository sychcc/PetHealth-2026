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

  const vaccines = await prisma.vaccine.findMany({
    where: { pet_id: BigInt(id) },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(
    vaccines.map((v) => ({ ...v, id: String(v.id), pet_id: String(v.pet_id) })),
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
    vaccine_name,
    date,
    next_due_date,
    clinic,
    vet_name,
    cost,
    photo_url,
  } = await req.json();

  if (!vaccine_name || !date) {
    return NextResponse.json(
      { error: "疫苗名稱、接種日期為必填" },
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

  const vaccine = await prisma.vaccine.create({
    data: {
      pet_id: BigInt(id),
      vaccine_name,
      date: new Date(date),
      next_due_date: next_due_date ? new Date(next_due_date) : null,
      clinic,
      vet_name,
      cost,
      photo_url,
    },
  });

  return NextResponse.json(
    { ...vaccine, id: String(vaccine.id), pet_id: String(vaccine.pet_id) },
    { status: 201 },
  );
}
