import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id, itemId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未登入" }, { status: 401 })
  }

  const { is_completed } = await req.json()

  const updated = await prisma.petChecklistItem.update({
    where: { id: BigInt(itemId) },
    data: {
      is_completed,
      completed_at: is_completed ? new Date() : null,
    },
  })

  return NextResponse.json({
    ...updated,
    id: String(updated.id),
    pet_id: String(updated.pet_id),
  })
}