# PetHealth

PetHealth 是一個使用 Next.js 16 全端開發的寵物健康管理系統，整合 PostgreSQL 資料庫與 Gemini AI，透過 Docker 容器化後部署至 AWS，並搭配 EC2 x2 + Application Load Balancer 實現高可用性架構。

**線上 Demo：** [https://pethealth.sychcc.net](https://pethealth.sychcc.net)

![PetHealth 首頁](./docs/pethealth_landingpage.png)

---

## 功能特色

- **寵物檔案管理** — 建立並管理多隻寵物的個人檔案
- **疫苗記錄** — 追蹤疫苗接種歷史，自動提醒到期日
- **體重追蹤** — 記錄體重變化，透過 Chart.js 折線圖視覺化趨勢
- **就醫記錄** — 記錄就診資訊、診斷結果與處方
- **AI 健康分析** — 由 Gemini API 自動生成健康摘要
- **AI 健康諮詢** — 透過 Gemini Function Calling 即時回答寵物健康問題
- **健康清單** — 管理一次性與年度健康任務的完成狀況
- **Email 提醒** — 透過 GitHub Actions 排程，由 SendGrid 自動發送通知
- **照片上傳** — 寵物照片儲存於 AWS S3
- **會員系統** — 支援帳號密碼登入及 Google OAuth 第三方登入

---

## 技術棧

### 前端

| 技術 | 用途 |
| --- | --- |
| Next.js 16.1.6 | 全端 React 框架（App Router） |
| TypeScript | 型別安全 |
| Tailwind CSS | Utility-first 樣式 |
| Chart.js + react-chartjs-2 | 體重趨勢圖表 |
| NextAuth.js | Session 管理（JWT） |

### 後端

| 技術 | 用途 |
| --- | --- |
| Next.js API Routes | RESTful API 端點 |
| Prisma ORM 7 | 型別安全的資料庫存取 |
| NextAuth.js | 帳號密碼 + Google OAuth 驗證 |
| bcrypt | 密碼加密 |
| @google/generative-ai | Gemini AI 整合 |
| @sendgrid/mail | Email 通知 |
| @aws-sdk/client-s3 | 照片上傳至 S3 |

### 基礎架構

| 技術 | 用途 |
| --- | --- |
| AWS EC2 (x2) | 應用程式伺服器（Docker + Nginx） |
| AWS RDS PostgreSQL | 託管關聯式資料庫 |
| AWS S3 | 寵物照片儲存 |
| AWS CloudFront | CDN + HTTPS 終止 |
| AWS Application Load Balancer | 跨 EC2 流量分配 |
| Docker | 容器化（Multi-stage build） |
| Nginx | 反向代理 |
| GitHub Actions | 自動化 Email 提醒排程 |

---

## 系統架構圖

![系統架構](./docs/system_architecture.png)

---

## 部署架構圖

![部署架構](./docs/deployment_architecture.png)

---

## 高可用性設定

本專案使用兩台 EC2 搭配 Application Load Balancer，確保即使其中一台故障也不會影響使用者。

### 架構說明

- **EC2 x2** — 各自獨立運行相同的 Docker container
- **ALB** — 將流量分配至兩台 EC2，每 30 秒進行健康檢查
- **CloudFront** — 位於 ALB 前端的 CDN 層，負責 HTTPS 終止
- **RDS** — 兩台 EC2 共用同一個 PostgreSQL 資料庫

### 部署至兩台 EC2

```bash
# EC2 #1
ssh -i your-key.pem ubuntu@<EC2_1_IP>
docker pull sychcc/pethealth:latest
docker stop pethealth && docker rm pethealth
docker run -d --name pethealth -p 3000:3000 --restart always --env-file .env sychcc/pethealth:latest

# EC2 #2
ssh -i your-key.pem ubuntu@<EC2_2_IP>
docker pull sychcc/pethealth:latest
docker stop pethealth && docker rm pethealth
docker run -d --name pethealth -p 3000:3000 --restart always --env-file .env sychcc/pethealth:latest
```

---

## 資料庫設計（ERD）

```mermaid
erDiagram
  User ||--o{ Pet : "1:N"
  Pet ||--o{ Vaccine : "1:N"
  Pet ||--o{ WeightRecord : "1:N"
  Pet ||--o{ MedicalRecord : "1:N"
  Pet ||--o{ Reminder : "1:N"
  Pet ||--o{ AiAnalysis : "1:N"
  Pet ||--o{ PetChecklistItem : "1:N"

  User {
    BigInt id PK
    String email UK
    String password "nullable"
    String provider
  }
  Pet {
    BigInt id PK
    BigInt user_id FK
    String name
    String species
    String gender "nullable"
    Decimal target_weight "nullable"
  }
  Vaccine {
    BigInt id PK
    BigInt pet_id FK
    String vaccine_name
    DateTime next_due_date "nullable"
  }
  WeightRecord {
    BigInt id PK
    BigInt pet_id FK
    Decimal weight
    DateTime date
  }
  MedicalRecord {
    BigInt id PK
    BigInt pet_id FK
    String brief_name
    DateTime next_appointment "nullable"
    String diagnosis "nullable"
    Int cost "nullable"
  }
  PetChecklistItem {
    BigInt id PK
    BigInt pet_id FK
    String item_key
    Boolean is_completed
  }
  Reminder {
    BigInt id PK
    BigInt pet_id FK
    DateTime due_date
    Boolean sent
  }
  AiAnalysis {
    BigInt id PK
    BigInt pet_id FK
    String type "auto or chat"
    String result "nullable"
  }
```

設計重點：

- `onDelete: Cascade` — 刪除寵物時自動清除所有關聯資料
- `password` 為 nullable — Google OAuth 用戶無需密碼
- `provider` 欄位區分帳號密碼 / Google 登入用戶

---

## API 設計

> API 文件：[PetHealth API Docs](https://sychcc.stoplight.io/docs/pethealth/kuvmgl9p9swk6-pet-health-api)

### 會員驗證

| 方法 | 端點 | 說明 |
| --- | --- | --- |
| POST | `/api/auth/signup` | 帳號密碼註冊 |
| POST | `/api/auth/[...nextauth]` | NextAuth 登入（帳號密碼 + Google OAuth） |

### 寵物管理

| 方法 | 端點 | 說明 |
| --- | --- | --- |
| GET | `/api/pets` | 取得目前使用者的所有寵物 |
| POST | `/api/pets` | 新增寵物 |
| GET | `/api/pets/:id` | 取得單一寵物資料 |
| PUT | `/api/pets/:id` | 更新寵物資料 |
| DELETE | `/api/pets/:id` | 刪除寵物（連帶刪除所有關聯資料） |

### 健康記錄

| 方法 | 端點 | 說明 |
| --- | --- | --- |
| GET/POST | `/api/pets/:id/vaccines` | 列表 / 新增疫苗記錄 |
| PUT/DELETE | `/api/pets/:id/vaccines/:vaccineId` | 更新 / 刪除疫苗記錄 |
| GET/POST | `/api/pets/:id/weight` | 列表 / 新增體重記錄 |
| DELETE | `/api/pets/:id/weight/:weightId` | 刪除體重記錄 |
| GET/POST | `/api/pets/:id/medical` | 列表 / 新增就醫記錄 |
| PUT/DELETE | `/api/pets/:id/medical/:medicalId` | 更新 / 刪除就醫記錄 |

### 健康清單

| 方法 | 端點 | 說明 |
| --- | --- | --- |
| GET | `/api/pets/:id/checklist` | 取得清單項目 |
| POST | `/api/pets/:id/checklist` | 初始化清單（狗 / 貓模板） |
| PUT | `/api/pets/:id/checklist/:itemId` | 切換項目完成狀態 |

### AI 功能

| 方法 | 端點 | 說明 |
| --- | --- | --- |
| GET | `/api/pets/:id/ai-summary` | 自動健康摘要（含快取 + 重新分析） |
| POST | `/api/pets/:id/ai-chat` | AI 健康諮詢（Gemini Function Calling） |

### 其他

| 方法 | 端點 | 說明 |
| --- | --- | --- |
| POST | `/api/upload` | 上傳照片至 AWS S3 |

**所有路由均需：** NextAuth Session 驗證 + 資源擁有權檢查（401/403）

---

## AI Agent — 技術亮點

### AI 健康摘要

GET `/api/pets/:id/ai-summary`

- 優先從 `ai_analyses` 資料表讀取快取（type: `"auto"`）
- 加上 `?refresh=true` 可強制重新分析
- 若無任何健康資料，直接回傳 `null`，不呼叫 Gemini
- 每日限制分析一次，避免 API 配額耗盡

### AI 健康諮詢 — Gemini Function Calling

AI 諮詢功能透過 **Gemini Function Calling** 實作 agentic loop，讓模型自行決定是否查詢資料庫，確保回答是基於真實資料而非 AI 猜測。

```
使用者送出問題
        │
        ▼
Next.js API Route
        │  問題 + system prompt + 4 個 tool 定義
        ▼
Gemini 2.0 Flash
        │  自行決定要呼叫哪些工具
        ▼
executeTool() — 透過 Prisma 查詢 PostgreSQL
  ├── get_weight_records（體重記錄）
  ├── get_vaccine_records（疫苗記錄）
  ├── get_medical_records（就醫記錄）
  └── get_checklist（健康清單）
        │  回傳真實資料
        ▼
Gemini 生成最終回答
        │
        ▼
存入 ai_analyses 資料表（type: "chat"）
        │
        ▼
回傳結果給使用者
```

---

## 驗證流程

```
帳號密碼登入：
  email + password → bcrypt.compare() → JWT → Cookie

Google OAuth：
  Google callback → signIn() → 自動建立新用戶 → JWT → Cookie

每個 API 請求：
  Cookie → getServerSession() → 驗證資源擁有權 → 執行業務邏輯
```

---

## React 組件架構

```
RootLayout (app/layout.tsx) — Server Component
  └── Providers (app/providers.tsx) — SessionProvider
        ├── Header (components/Header.tsx) — useSession, signOut
        └── {children} — 依 URL 路由
              ├── 首頁 (app/page.tsx)
              ├── 驗證頁面 (app/auth/signin, signup)
              ├── 寵物列表 (app/pets/page.tsx)
              ├── 寵物詳情 (app/pets/[id]/page.tsx)
              └── 功能頁面
                    ├── app/pets/[id]/vaccines/
                    ├── app/pets/[id]/weight/
                    └── app/pets/[id]/medical/
```

狀態管理方式：

- **驗證狀態** — 透過 `useSession()` 全域管理（SessionProvider）
- **頁面狀態** — `useState` + `useEffect` + `fetch`（此規模不需要 Redux）
- **無 Context/Redux** — 各頁面獨立 fetch 所需資料

---

## Email 提醒

透過 GitHub Actions 自動排程，每日台灣時間早上 9 點執行。

- 疫苗到期前 3 天發送提醒
- 疫苗到期前 1 天發送提醒
- 由 SendGrid 發送
- Workflow：`.github/workflows/send-reminders.yml`

---

## 單元測試

```bash
npm test
```

![測試結果](./docs/test_results.png)

使用 Jest + ts-jest 對核心驗證邏輯進行單元測試：

- `auth.test.ts` — validateUser、validatePetOwner（401 / 403 / 404 邊界情況）
- `pets.test.ts` — POST /api/pets 必填欄位驗證

---

## 本機開發

### 環境需求

- Node.js 22+
- Docker Desktop
- PostgreSQL（本機或 AWS RDS）

### 安裝步驟

```bash
# 1. Clone 專案
git clone https://github.com/sychcc/PetHealth-2026.git
cd PetHealth-2026

# 2. 安裝套件
npm install

# 3. 設定環境變數
cp .env.example .env
# 填入對應的值

# 4. 執行資料庫 migration
npx prisma migrate dev

# 5. 啟動開發伺服器
npm run dev
```

### 環境變數

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket
GEMINI_API_KEY=your-gemini-key
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=your-email
```

---

## Docker Build

```bash
# 為 EC2 建置 production image（AMD64）
docker buildx build \
  --platform linux/amd64 \
  -t sychcc/pethealth:latest \
  --push \
  .

# 本機執行
docker run -p 3000:3000 --env-file .env sychcc/pethealth:latest
```

---

## 部署

```bash
# 在每台 EC2 上執行
docker pull sychcc/pethealth:latest
docker stop pethealth && docker rm pethealth
docker run -d \
  --name pethealth \
  -p 3000:3000 \
  --restart always \
  --env-file .env \
  sychcc/pethealth:latest

# 執行資料庫 migration
npx prisma migrate deploy
```

---

## 專案結構

```
pethealth/
├── .github/
│   └── workflows/
│       └── send-reminders.yml  # Email 提醒排程
├── app/
│   ├── api/                    # API Routes
│   │   ├── auth/               # 驗證端點
│   │   ├── pets/               # 寵物 CRUD + 巢狀資源
│   │   │   └── [id]/
│   │   │       ├── vaccines/
│   │   │       ├── weight/
│   │   │       ├── medical/
│   │   │       ├── checklist/
│   │   │       ├── ai-chat/
│   │   │       └── ai-summary/
│   │   └── upload/             # S3 照片上傳
│   ├── pets/                   # 前端頁面
│   ├── auth/                   # 登入 / 註冊頁面
│   └── components/             # 共用元件
├── lib/
│   ├── auth.ts                 # validateUser, validatePetOwner
│   └── prisma.ts               # Prisma client
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── scripts/
│   └── sendReminders.ts        # Email 提醒腳本
├── __tests__/
│   ├── auth.test.ts
│   └── pets.test.ts
└── Dockerfile                  # Multi-stage build
```
