import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

//定義validateUserResult 不然route.ts的typescript會不知道他的型別
type ValidateUserResult = { error: string; status: number } | { email: string };

//判斷是否登入
export async function validateUser(): Promise<ValidateUserResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "未登入", status: 401 };
  }
  //成功的話
  return { email: session.user.email };
  //   session = {
  //   user: {
  //     email: "a@gmail.com",
  //     name: "小明",
  //   },
  //   expires: "2026-05-01"
  // }
}
//判斷user是否有該寵物的權限
export async function validatePetOwner(id: string, email: string) {
  const pet = await prisma.pet.findUnique({
    where: { id: BigInt(id) },
  });

  if (!pet) {
    return { error: "寵物不存在", status: 404 };
  }
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: "使用者不存在", status: 401 };
  }

  if (pet.user_id !== user.id) {
    return { error: "無權限", status: 403 };
  }
  //成功的話
  return { pet, user };
}
