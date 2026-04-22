import { NextRequest, NextResponse } from "next/server";
import { validatePetOwner, validateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  tools: [
    {
      functionDeclarations: [
        {
          name: "get_weight_records",
          description: "取得寵物的體重記錄",
          parameters: {
            type: "OBJECT",
            properties: {
              petId: { type: "STRING", description: "寵物的 ID" },
            },
            required: ["petId"],
          },
        },
        {
          name: "get_vaccine_records",
          description: "取得寵物的疫苗記錄",
          parameters: {
            type: "OBJECT",
            properties: {
              petId: { type: "STRING", description: "寵物的 ID" },
            },
            required: ["petId"],
          },
        },
        {
          name: "get_medical_records",
          description: "取得寵物的就醫記錄",
          parameters: {
            type: "OBJECT",
            properties: {
              petId: { type: "STRING", description: "寵物的 ID" },
            },
            required: ["petId"],
          },
        },
        {
          name: "get_checklist",
          description: "取得寵物的必做事項完成狀況",
          parameters: {
            type: "OBJECT",
            properties: {
              petId: { type: "STRING", description: "寵物的 ID" },
            },
            required: ["petId"],
          },
        },
      ],
    },
  ] as any,
});

// 執行工具的函式
async function executeTool(name: string, petId: string) {
  switch (name) {
    case "get_weight_records":
      const weights = await prisma.weightRecord.findMany({
        where: { pet_id: BigInt(petId) },
        orderBy: { date: "desc" },
        take: 10,
      });
      return weights.map((w) => ({
        date: w.date ? new Date(w.date).toISOString().split("T")[0] : "未知",
        weight: w.weight,
        notes: w.notes,
      }));

    case "get_vaccine_records":
      const vaccines = await prisma.vaccine.findMany({
        where: { pet_id: BigInt(petId) },
        orderBy: { date: "desc" },
        take: 10,
      });
      return vaccines.map((v) => ({
        name: v.vaccine_name,
        date: v.date ? new Date(v.date).toISOString().split("T")[0] : "未知",
        next_due: v.next_due_date
          ? new Date(v.next_due_date).toISOString().split("T")[0]
          : "未設定",
      }));

    case "get_medical_records":
      const medicals = await prisma.medicalRecord.findMany({
        where: { pet_id: BigInt(petId) },
        orderBy: { date: "desc" },
        take: 10,
      });
      return medicals.map((m) => ({
        date: m.date ? new Date(m.date).toISOString().split("T")[0] : "未知",
        brief_name: m.brief_name,
        diagnosis: m.diagnosis,
        cost: m.cost,
      }));

    case "get_checklist":
      const items = await prisma.petChecklistItem.findMany({
        where: { pet_id: BigInt(petId) },
      });
      return items.map((i) => ({
        label: i.label,
        type: i.type,
        is_completed: i.is_completed,
      }));

    default:
      return null;
  }
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

  const petResult = await validatePetOwner(id, authResult.email);
  if ("error" in petResult) {
    return NextResponse.json(
      { error: petResult.error },
      { status: petResult.status },
    );
  }
  const { pet } = petResult;
  const { question } = await req.json();
  if (!question)
    return NextResponse.json({ error: "請輸入問題" }, { status: 400 });

  const systemPrompt = `你是一個專業的寵物健康助理，正在幫助分析寵物「${pet.name}」（${pet.species}）的健康狀況。
請用繁體中文回答，並在需要時使用工具查詢資料。另外只能回答關於寵物 ${pet.name}健康相關問題，如果使用者問題和寵物健康無關，請禮貌拒絕並說明你只能回答寵物的問題`;

  //呼叫前，檢查今天使用幾次ai-chat了（一天3次）

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayCount = await prisma.aiAnalysis.count({
    where: {
      pet_id: BigInt(id),
      type: "chat",
      created_at: { gte: today },
    },
  });
  if (todayCount >= 3) {
    return NextResponse.json({
      message: "今天已達到每日限制的題數三題，請明天再發問",
    });
  }
  // 第一次呼叫 Gemini
  const chat = model.startChat({
    history: [
      { role: "user", parts: [{ text: systemPrompt }] },
      {
        role: "model",
        parts: [{ text: "好的，我會幫您分析寵物的健康狀況。" }],
      },
    ],
  });

  let response = await chat.sendMessage(question);
  let result = response.response;

  // 處理 Function Calling 循環
  while (result.functionCalls() && result.functionCalls()!.length > 0) {
    const functionCalls = result.functionCalls()!;
    const functionResults = [];

    for (const call of functionCalls) {
      const toolResult = await executeTool(call.name, id);
      functionResults.push({
        functionResponse: {
          name: call.name,
          response: { result: toolResult },
        },
      });
    }

    // 把工具結果還給 Gemini
    response = await chat.sendMessage(functionResults as any);
    result = response.response;
  }

  const answer = result.text();

  // 存進資料庫（type = chat）
  await prisma.aiAnalysis.create({
    data: {
      pet_id: BigInt(id),
      type: "chat",
      input_data: question,
      result: JSON.stringify({ answer }),
    },
  });

  return NextResponse.json({ answer });
}
