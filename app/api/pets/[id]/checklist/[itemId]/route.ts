import { NextRequest, NextResponse } from "next/server";
import { validateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const authResult = await validateUser();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }
  const { itemId } = await params;

  const { is_completed } = await req.json();

  const updated = await prisma.petChecklistItem.update({
    where: { id: BigInt(itemId) },
    data: {
      is_completed,
      completed_at: is_completed ? new Date() : null,
    },
  });

  return NextResponse.json({
    ...updated,
    id: String(updated.id),
    pet_id: String(updated.pet_id),
  });
}
