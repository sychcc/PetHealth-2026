import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" })


export async function GET(
    req:NextRequest,
    {params}:{params:Promise<{id:string}>}
) {
  const {id}=await params
    //判斷有沒有登入
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未登入" }, { status: 401 })
  }
// 1. 驗證寵物是否存在還有權限
  const pet = await prisma.pet.findUnique({ where: { id: BigInt(id) } })
   if (!pet) return NextResponse.json({ error: "寵物不存在" }, { status: 404 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (pet.user_id !== user!.id) return NextResponse.json({ error: "無權限" }, { status: 403 })
  
//2. 拿資料
const weights=await prisma.weightRecord.findMany({
    where:{pet_id:BigInt(id)},
    orderBy:{date:'desc'},
    take:10,
})

const medicals=await prisma.medicalRecord.findMany({
    where:{pet_id:BigInt(id)},
    orderBy:{date:'desc'},
    take:10,
})

const vaccines=await prisma.vaccine.findMany({
    where:{pet_id:BigInt(id)},
    orderBy:{date:'desc'},
    take:10,
})

// 整理prompt

const prompt=
`你是一個專業的寵物健康分析師，請用繁體中文分析以下寵物的健康狀況。
寵物資料：
- 名字：${pet.name}
- 品種：${pet.species}
- 生日：${pet.birthdate?.toISOString().split("T")[0]}

最近體重記錄（由新到舊）：
${weights.length>0
    ?weights.map((w)=>`-${w.date.toISOString().split("T")[0]}:${w.weight}kg`).join('\n')
    :"無紀錄"
}


最近就醫記錄：
${medicals.length>0
    ?medicals.map((m)=>`-${m.date.toISOString().split("T")[0]}:${m.brief_name},${m.symptoms || "無症狀記錄"},${m.diagnosis || "無診斷記錄"},${m.prescription || "無處方籤記錄"}${m.photo_url||"無提供照片"}`).join('\n')
    :"無紀錄"
}

疫苗記錄：
${vaccines.length>0
    ?vaccines.map((v)=>`- ${v.vaccine_name}：${v.date.toISOString().split("T")[0]}，下次到期：${v.next_due_date ? v.next_due_date.toISOString().split("T")[0] : "未設定"}`).join("\n")
    :"無紀錄"
}


請回傳 JSON 格式，不要加任何其他文字：
{
  "summary": "2-3句話的簡短摘要",
  "full_report": "完整的健康分析報告，包含飲食指南、活動量建議"
}
`

// 4. 呼叫 Gemini
  const result = await model.generateContent(prompt)
  const text = result.response.text()
  
  // 5. 解析 JSON
  const clean = text.replace(/```json|```/g, "").trim()
  const analysis = JSON.parse(clean)

  return NextResponse.json(analysis)

}

