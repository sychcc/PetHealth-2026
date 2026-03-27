import { prisma } from "@/lib/prisma";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

async function sendReminders() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 找今天到期的疫苗
  const vaccines = await prisma.vaccine.findMany({
    where: {
      next_due_date: { gte: today, lt: tomorrow },
    },
    include: { pet: { include: { user: true } } },
  });

  for (const vaccine of vaccines) {
    const email = vaccine.pet.user.email;
    if (!email) continue;

    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: `【PetHealth】${vaccine.pet.name} 今天需要打 ${vaccine.vaccine_name}`,
      html: `
        <h2>疫苗提醒</h2>
        <p>您的寵物 <strong>${vaccine.pet.name}</strong> 今天需要施打 <strong>${vaccine.vaccine_name}</strong>。</p>
        <p>請盡快預約獸醫！</p>
      `,
    });
    console.log(`已發送疫苗提醒給 ${email}`);
  }

  // 找今天的就醫預約
  const medicals = await prisma.medicalRecord.findMany({
    where: {
      date: { gte: today, lt: tomorrow },
    },
    include: { pet: { include: { user: true } } },
  });
  console.log("今天日期:", today, tomorrow);
  console.log("找到疫苗數量:", vaccines.length);
  console.log("找到就醫數量:", medicals.length);

  for (const medical of medicals) {
    const email = medical.pet.user.email;
    if (!email) continue;

    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: `【PetHealth】${medical.pet.name} 今天有就醫預約`,
      html: `
        <h2>就醫提醒</h2>
        <p>您的寵物 <strong>${medical.pet.name}</strong> 今天有就醫預約：<strong>${medical.brief_name}</strong>。</p>
        <p>請記得準時帶牠去看診！</p>
      `,
    });
    console.log(`已發送就醫提醒給 ${email}`);
  }

  console.log("提醒發送完成");
  await prisma.$disconnect();
}

sendReminders().catch(console.error);
