import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validatePetOwner, validateUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  //先判斷有沒有登入

  const authResult = await validateUser();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }
  //到這裡就一定有user => 一定有user id
  //validateUser 是return session
  const { id } = await params;

  //第二層判斷：有沒有寵物的權限

  const petResult = await validatePetOwner(id, authResult.email);
  if ("error" in petResult) {
    return NextResponse.json(
      { error: petResult.error },
      { status: petResult.status },
    );
  }
  //成功
  const { pet } = petResult;
  return NextResponse.json({
    ...pet,
    id: String(pet.id),
    user_id: String(pet.user_id),
  });
}

export async function PUT(
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

  const petResult = await validatePetOwner(id, authResult.email);
  if ("error" in petResult) {
    return NextResponse.json(
      { error: petResult.error },
      { status: petResult.status },
    );
  }

  const {
    name,
    species,
    breed,
    gender,
    target_weight,
    birthdate,
    chip_number,
    photo_url,
  } = await req.json();

  const updated = await prisma.pet.update({
    where: { id: BigInt(id) },
    data: {
      name,
      species,
      breed,
      gender,
      birthdate: new Date(birthdate),
      chip_number,
      target_weight,
      photo_url,
    },
  });

  return NextResponse.json({
    ...updated,
    id: String(updated.id),
    user_id: String(updated.user_id),
  });
}

export async function DELETE(
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

  await prisma.pet.delete({
    where: { id: BigInt(id) },
  });

  return NextResponse.json({ message: "刪除成功" });
}
