// import { prisma } from "@/lib/prisma";
// import sgMail from "@sendgrid/mail";

// sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// async function sendReminders() {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   const tomorrow = new Date(today);
//   tomorrow.setDate(tomorrow.getDate() + 1);

//   // 找今天到期的疫苗
//   const vaccines = await prisma.vaccine.findMany({
//     where: {
//       next_due_date: { gte: today, lt: tomorrow },
//     },
//     include: { pet: { include: { user: true } } },
//   });

//   for (const vaccine of vaccines) {
//     const email = vaccine.pet.user.email;
//     if (!email) continue;

//     await sgMail.send({
//       to: email,
//       from: process.env.SENDGRID_FROM_EMAIL!,
//       subject: `【PetHealth】${vaccine.pet.name} 今天需要打 ${vaccine.vaccine_name}`,
//       html: `
//         <h2>疫苗提醒</h2>
//         <p>您的寵物 <strong>${vaccine.pet.name}</strong> 今天需要施打 <strong>${vaccine.vaccine_name}</strong>。</p>
//         <p>請盡快預約獸醫！</p>
//       `,
//     });
//     console.log(`已發送疫苗提醒給 ${email}`);
//   }

//   // 找今天的就醫預約
//   const medicals = await prisma.medicalRecord.findMany({
//     where: {
//       date: { gte: today, lt: tomorrow },
//     },
//     include: { pet: { include: { user: true } } },
//   });
//   console.log("今天日期:", today, tomorrow);
//   console.log("找到疫苗數量:", vaccines.length);
//   console.log("找到就醫數量:", medicals.length);

//   for (const medical of medicals) {
//     const email = medical.pet.user.email;
//     if (!email) continue;

//     await sgMail.send({
//       to: email,
//       from: process.env.SENDGRID_FROM_EMAIL!,
//       subject: `【PetHealth】${medical.pet.name} 今天有就醫預約`,
//       html: `
//         <h2>就醫提醒</h2>
//         <p>您的寵物 <strong>${medical.pet.name}</strong> 今天有就醫預約：<strong>${medical.brief_name}</strong>。</p>
//         <p>請記得準時帶牠去看診！</p>
//       `,
//     });
//     console.log(`已發送就醫提醒給 ${email}`);
//   }

//   console.log("提醒發送完成");
//   await prisma.$disconnect();
// }

// sendReminders().catch(console.error);

import { prisma } from "@/lib/prisma";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

async function sendReminders() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const in3Days = new Date(today);
  in3Days.setDate(today.getDate() + 3);

  const in4Days = new Date(today);
  in4Days.setDate(today.getDate() + 4);

  // 疫苗：前3天 + 前1天
  const vaccines3 = await prisma.vaccine.findMany({
    where: { next_due_date: { gte: in3Days, lt: in4Days } },
    include: { pet: { include: { user: true } } },
  });

  const vaccines1 = await prisma.vaccine.findMany({
    where: {
      next_due_date: {
        gte: tomorrow,
        lt: new Date(tomorrow.getTime() + 86400000),
      },
    },
    include: { pet: { include: { user: true } } },
  });

  for (const vaccine of vaccines3) {
    const email = vaccine.pet.user.email;
    if (!email) continue;
    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: `【PetHealth】${vaccine.pet.name} 的 ${vaccine.vaccine_name} 還有 3 天到期`,
      html: `<h2>疫苗提醒</h2><p>您的寵物 <strong>${vaccine.pet.name}</strong> 的 <strong>${vaccine.vaccine_name}</strong> 將在 3 天後到期，請盡快預約獸醫！</p>`,
    });
    console.log(`[3天前] 疫苗提醒已發送給 ${email}`);
  }

  for (const vaccine of vaccines1) {
    const email = vaccine.pet.user.email;
    if (!email) continue;
    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: `【PetHealth】${vaccine.pet.name} 的 ${vaccine.vaccine_name} 明天到期`,
      html: `<h2>疫苗提醒</h2><p>您的寵物 <strong>${vaccine.pet.name}</strong> 的 <strong>${vaccine.vaccine_name}</strong> 明天就到期了，請記得今天預約！</p>`,
    });
    console.log(`[前1天] 疫苗提醒已發送給 ${email}`);
  }

  // 就醫：前3天 + 前1天
  const medicals3 = await prisma.medicalRecord.findMany({
    where: { date: { gte: in3Days, lt: in4Days } },
    include: { pet: { include: { user: true } } },
  });

  const medicals1 = await prisma.medicalRecord.findMany({
    where: {
      date: { gte: tomorrow, lt: new Date(tomorrow.getTime() + 86400000) },
    },
    include: { pet: { include: { user: true } } },
  });

  for (const medical of medicals3) {
    const email = medical.pet.user.email;
    if (!email) continue;
    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: `【PetHealth】${medical.pet.name} 還有 3 天就醫預約`,
      html: `<h2>就醫提醒</h2><p>您的寵物 <strong>${medical.pet.name}</strong> 在 3 天後有就醫預約：<strong>${medical.brief_name}</strong>。</p>`,
    });
    console.log(`[3天前] 就醫提醒已發送給 ${email}`);
  }

  for (const medical of medicals1) {
    const email = medical.pet.user.email;
    if (!email) continue;
    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: `【PetHealth】${medical.pet.name} 明天有就醫預約`,
      html: `<h2>就醫提醒</h2><p>您的寵物 <strong>${medical.pet.name}</strong> 明天有就醫預約：<strong>${medical.brief_name}</strong>，請記得準時帶牠去看診！</p>`,
    });
    console.log(`[前1天] 就醫提醒已發送給 ${email}`);
  }

  console.log("提醒發送完成");
  await prisma.$disconnect();
}

sendReminders().catch(console.error);
