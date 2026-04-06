import { NextRequest, NextResponse } from "next/server";
import { validatePetOwner, validateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite-preview",
});

export async function GET(
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
  const { pet } = petResult;

  //判斷是否要強制重新分析
  const refresh = req.nextUrl.searchParams.get("refresh") === "true";

  //判斷資料庫有沒有舊的auto分析
  if (!refresh) {
    const existing = await prisma.aiAnalysis.findFirst({
      where: { pet_id: BigInt(id), type: "auto" },
      orderBy: { created_at: "desc" },
    });
    if (existing) {
      const cached = JSON.parse(existing.result as string);
      return NextResponse.json({
        ...cached,
        cached: true,
        created_at: existing.created_at,
      });
    }
  }

  //2. 拿資料
  const weights = await prisma.weightRecord.findMany({
    where: { pet_id: BigInt(id) },
    orderBy: { date: "desc" },
    take: 10,
  });

  const medicals = await prisma.medicalRecord.findMany({
    where: { pet_id: BigInt(id) },
    orderBy: { date: "desc" },
    take: 10,
  });

  const vaccines = await prisma.vaccine.findMany({
    where: { pet_id: BigInt(id) },
    orderBy: { date: "desc" },
    take: 10,
  });

  const checklistItems = await prisma.petChecklistItem.findMany({
    where: { pet_id: BigInt(id) },
  });

  //如果沒有任何健康資料就不呼叫gemini
  if (weights.length === 0 && vaccines.length === 0 && medicals.length === 0) {
    return NextResponse.json({ summary: null, full_report: null });
  }

  // 整理prompt

  const prompt = `你是一個專業的寵物健康分析師，請用繁體中文分析以下寵物的健康狀況。
寵物資料：
- 名字：${pet.name}
- 物種：${pet.species}
- 品種: ${pet.breed}
- 性別: ${pet.gender}
- 生日：${pet.birthdate?.toISOString().split("T")[0]}

最近體重記錄（由新到舊）：
${
  weights.length > 0
    ? weights
        .map(
          (w) =>
            `-${w.date ? new Date(w.date).toISOString().split("T")[0] : "未知日期"}:${w.weight}kg`,
        )
        .join("\n")
    : "無紀錄"
}


最近就醫記錄：
${
  medicals.length > 0
    ? medicals
        .map(
          (m) =>
            `-${m.date ? new Date(m.date).toISOString().split("T")[0] : "未知日期"}:${m.brief_name},${m.symptoms || "無症狀記錄"},${m.diagnosis || "無診斷記錄"},${m.prescription || "無處方籤記錄"}${m.photo_url || "無提供照片"}`,
        )
        .join("\n")
    : "無紀錄"
}

疫苗記錄：
${
  vaccines.length > 0
    ? vaccines
        .map(
          (v) =>
            `- ${v.vaccine_name}：${v.date ? new Date(v.date).toISOString().split("T")[0] : "未知日期"}，下次到期：${v.next_due_date ? new Date(v.next_due_date).toISOString().split("T")[0] : "未設定"}`,
        )
        .join("\n")
    : "無紀錄"
}


必做事項完成狀況：
一次性事項：
${checklistItems
  .filter((i) => i.type === "one_time")
  .map((i) => `- ${i.label}：${i.is_completed ? "已完成" : "未完成"}`)
  .join("\n")}

每年定期事項（${new Date().getFullYear()}）：
${checklistItems
  .filter((i) => i.type === "annual")
  .map((i) => {
    const doneThisYear = !!(
      i.completed_at &&
      new Date(i.completed_at).getFullYear() === new Date().getFullYear()
    );
    return `- ${i.label}：${doneThisYear ? "今年已完成" : "今年尚未完成"}`;
  })
  .join("\n")}


請回傳 JSON 格式，不要加任何其他文字：
{
  "summary": "2-3句話的簡短摘要",
  "full_report": "完整的健康分析報告，包含飲食指南、活動量建議"
}
`;

  // 4. 呼叫 Gemini
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // 5. 解析 JSON
  const clean = text.replace(/```json|```/g, "").trim();
  const analysis = JSON.parse(clean);

  // 6.存資料庫
  await prisma.aiAnalysis.create({
    data: {
      pet_id: BigInt(id),
      type: "auto",
      input_data: prompt,
      result: JSON.stringify(analysis),
    },
  });

  return NextResponse.json(analysis);
}
