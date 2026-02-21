import { NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getServerSession } from "next-auth"

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未登入" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File

  if (!file) {
    return NextResponse.json({ error: "沒有檔案" }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "檔案超過 5MB" }, { status: 400 })
  }

  if (!["image/jpeg", "image/png"].includes(file.type)) {
    return NextResponse.json({ error: "只支援 JPG、PNG" }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `pets/${Date.now()}-${file.name}`

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    })
  )

  const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`

  return NextResponse.json({ url })
}