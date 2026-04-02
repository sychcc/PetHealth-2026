import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();
  //檢查註冊欄位
  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "名稱、Email、密碼為必填" },
      { status: 400 },
    );
  }
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  //檢查email是否存在
  if (existingUser) {
    return NextResponse.json({ error: "此帳號已被註冊" }, { status: 400 });
  }
  //加密密碼, 等級10
  const hashedPassword = await bcrypt.hash(password, 10);
  //建立新使用者
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      provider: "credentials",
    },
  });
  //回傳給前端
  return NextResponse.json(
    { message: "註冊成功", userId: String(user.id) },
    { status: 201 },
  );
}
