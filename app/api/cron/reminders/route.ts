import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import sgMail from "@sendgrid/mail"

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function GET(request: Request) {
  // 驗證只有 Vercel Cron 可以呼叫
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const in3Days = new Date(today)
  in3Days.setDate(today.getDate() + 3)
  const in4Days = new Date(today)
  in4Days.setDate(today.getDate() + 4)

  let sent = 0

  // 疫苗前3天
  const vaccines3 = await prisma.vaccine.findMany({
    where: { next_due_date: { gte: in3Days, lt: in4Days } },
    include: { pet: { include: { user: true } } },
  })
  for (const v of vaccines3) {
    if (!v.pet.user.email) continue
    await sgMail.send({
      to: v.pet.user.email,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: `【PetHealth】${v.pet.name} 的 ${v.vaccine_name} 還有 3 天到期`,
      html: `<p>您的寵物 <strong>${v.pet.name}</strong> 的 <strong>${v.vaccine_name}</strong> 將在 3 天後到期，請盡快預約獸醫！</p>`,
    })
    sent++
  }

  // 疫苗前1天
  const vaccines1 = await prisma.vaccine.findMany({
    where: { next_due_date: { gte: tomorrow, lt: in3Days } },
    include: { pet: { include: { user: true } } },
  })
  for (const v of vaccines1) {
    if (!v.pet.user.email) continue
    await sgMail.send({
      to: v.pet.user.email,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: `【PetHealth】${v.pet.name} 的 ${v.vaccine_name} 明天到期`,
      html: `<p>您的寵物 <strong>${v.pet.name}</strong> 的 <strong>${v.vaccine_name}</strong> 明天就到期了！</p>`,
    })
    sent++
  }

  return NextResponse.json({ success: true, sent })
}