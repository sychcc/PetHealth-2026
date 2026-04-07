# PetHealth

A full-stack pet health management system built with Next.js 16, PostgreSQL, and Gemini AI — containerized with Docker and deployed on AWS with a high-availability architecture.

**Live Demo:** [https://pethealth.sychcc.net](https://pethealth.sychcc.net)

![PetHealth Landing Page](./docs/pethealth_landingpage.png)

---

## Features

- **Pet Profile Management** — Create and manage profiles for multiple pets
- **Vaccine Records** — Track vaccination history with expiry reminders
- **Weight Tracking** — Log weight over time with Chart.js trend visualization
- **Medical History** — Record vet visits, diagnoses, and prescriptions
- **AI Health Analysis** — Auto-generated health summaries powered by Gemini API
- **AI Health Chat** — Ask questions about your pet using Gemini Function Calling
- **Pet Checklist** — One-time and annual health task tracking
- **Email Reminders** — Automated SendGrid notifications via cron job
- **Photo Upload** — Pet photos stored on AWS S3
- **Authentication** — Credentials login + Google OAuth via NextAuth.js

---

## Tech Stack

### Frontend

| Technology                 | Purpose                                 |
| -------------------------- | --------------------------------------- |
| Next.js 16.1.6             | Full-stack React framework (App Router) |
| TypeScript                 | Type safety                             |
| Tailwind CSS               | Utility-first styling                   |
| Chart.js + react-chartjs-2 | Weight trend charts                     |
| NextAuth.js                | Session management (JWT)                |

### Backend

| Technology            | Purpose                                     |
| --------------------- | ------------------------------------------- |
| Next.js API Routes    | RESTful API endpoints                       |
| Prisma ORM 7          | Type-safe database access                   |
| NextAuth.js           | Authentication (Credentials + Google OAuth) |
| bcrypt                | Password hashing                            |
| @google/generative-ai | Gemini AI integration                       |
| @sendgrid/mail        | Email notifications                         |
| @aws-sdk/client-s3    | Photo upload to S3                          |

### Infrastructure

| Technology                    | Purpose                                   |
| ----------------------------- | ----------------------------------------- |
| AWS EC2 (x2)                  | Application servers (Docker + Nginx)      |
| AWS RDS PostgreSQL            | Managed relational database               |
| AWS S3                        | Pet photo storage                         |
| AWS CloudFront                | CDN + HTTPS termination                   |
| AWS Application Load Balancer | Traffic distribution across EC2 instances |
| Docker                        | Containerization (multi-stage build)      |
| Nginx                         | Reverse proxy                             |

---

## System Architecture

![System Architecture](./docs/system_architecture.png)

---

## Deployment Architecture

![Deployment Architecture](./docs/deployment_architecture.png)

---

## Database Design (ERD)

```
users (1)
  └── pets (N)                    user_id → users.id
        ├── vaccines (N)          pet_id  → pets.id  onDelete: Cascade
        ├── weight_records (N)    pet_id  → pets.id  onDelete: Cascade
        ├── medical_records (N)   pet_id  → pets.id  onDelete: Cascade
        ├── reminders (N)         pet_id  → pets.id  onDelete: Cascade
        ├── ai_analyses (N)       pet_id  → pets.id  onDelete: Cascade
        └── pet_checklist_items(N)pet_id  → pets.id  onDelete: Cascade
```

Key design decisions:

- `onDelete: Cascade` on all child tables — deleting a pet removes all associated records
- `password` is nullable on `users` — Google OAuth users have no password
- `provider` field distinguishes credential vs Google users

---

## API Design

### Authentication

| Method | Endpoint                  | Description                                 |
| ------ | ------------------------- | ------------------------------------------- |
| POST   | `/api/auth/signup`        | Register with email + password              |
| POST   | `/api/auth/[...nextauth]` | NextAuth login (credentials + Google OAuth) |

### Pets

| Method | Endpoint        | Description                       |
| ------ | --------------- | --------------------------------- |
| GET    | `/api/pets`     | Get all pets for current user     |
| POST   | `/api/pets`     | Create a new pet                  |
| GET    | `/api/pets/:id` | Get single pet                    |
| PUT    | `/api/pets/:id` | Update pet                        |
| DELETE | `/api/pets/:id` | Delete pet (cascades all records) |

### Health Records

| Method     | Endpoint                            | Description                    |
| ---------- | ----------------------------------- | ------------------------------ |
| GET/POST   | `/api/pets/:id/vaccines`            | List / create vaccine records  |
| PUT/DELETE | `/api/pets/:id/vaccines/:vaccineId` | Update / delete vaccine        |
| GET/POST   | `/api/pets/:id/weight`              | List / create weight records   |
| DELETE     | `/api/pets/:id/weight/:weightId`    | Delete weight record           |
| GET/POST   | `/api/pets/:id/medical`             | List / create medical records  |
| PUT/DELETE | `/api/pets/:id/medical/:medicalId`  | Update / delete medical record |

### Checklist

| Method | Endpoint                          | Description                             |
| ------ | --------------------------------- | --------------------------------------- |
| GET    | `/api/pets/:id/checklist`         | Get checklist items                     |
| POST   | `/api/pets/:id/checklist`         | Initialize checklist (dog/cat template) |
| PUT    | `/api/pets/:id/checklist/:itemId` | Mark item complete/incomplete           |

### AI

| Method | Endpoint                   | Description                             |
| ------ | -------------------------- | --------------------------------------- |
| GET    | `/api/pets/:id/ai-summary` | Auto health analysis (cached + refresh) |
| POST   | `/api/pets/:id/ai-chat`    | AI health chat with Function Calling    |

### Other

| Method | Endpoint              | Description                        |
| ------ | --------------------- | ---------------------------------- |
| POST   | `/api/upload`         | Upload photo to AWS S3             |
| GET    | `/api/cron/reminders` | Trigger email reminders (cron job) |

**All routes require:** NextAuth session validation + resource ownership check (401/403)

---

## AI Agent — Technical Highlight

The AI chat feature uses **Gemini Function Calling**, allowing the model to autonomously query the database for real pet data before answering.

```
User sends question
        │
        ▼
Next.js API Route
        │  question + system prompt + 4 tool definitions
        ▼
Gemini 3.1 Flash Lite Preview
        │  decides which tool(s) to call
        ▼
executeTool() — queries PostgreSQL via Prisma
  ├── get_weight_records
  ├── get_vaccine_records
  ├── get_medical_records
  └── get_checklist
        │  real data returned
        ▼
Gemini generates final answer
        │
        ▼
Saved to ai_analyses table (type: "chat")
        │
        ▼
Response returned to user
```

---

## React Component Structure

```
RootLayout (app/layout.tsx) — Server Component
  └── Providers (app/providers.tsx) — SessionProvider
        ├── Header (components/Header.tsx) — useSession, signOut
        └── {children} — routed by URL
              ├── HomePage (app/page.tsx)
              ├── AuthPages (app/auth/signin, signup)
              ├── PetsPage (app/pets/page.tsx)
              ├── PetDetailPage (app/pets/[id]/page.tsx)
              └── FeaturePages
                    ├── app/pets/[id]/vaccines/
                    ├── app/pets/[id]/weight/
                    └── app/pets/[id]/medical/
```

State management approach:

- **Authentication state** — `useSession()` from NextAuth (global, via SessionProvider)
- **Page-level state** — `useState` + `useEffect` + `fetch` (no Redux needed at this scale)
- **No Context/Redux** — each page fetches its own data independently

---

## Authentication Flow

```
Credentials Login:
  email + password → bcrypt.compare() → JWT → Cookie

Google OAuth:
  Google callback → signIn() → auto-create user if new → JWT → Cookie

Every API request:
  Cookie → getServerSession() → validate ownership → execute logic
```

---

## Local Development

### Prerequisites

- Node.js 22+
- Docker Desktop
- PostgreSQL (local or AWS RDS)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/sychcc/pethealth.git
cd pethealth

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your values

# 4. Run database migrations
npx prisma migrate dev

# 5. Start development server
npm run dev
```

### Environment Variables

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
# Build for production (AMD64 for EC2)
docker buildx build \
  --platform linux/amd64 \
  -t your-dockerhub/pethealth:latest \
  --push \
  .

# Run locally
docker run -p 3000:3000 --env-file .env sychcc/pethealth:latest
```

---

## Deployment

```bash
# On each EC2 instance
docker pull your-dockerhub/pethealth:latest
docker stop pethealth && docker rm pethealth
docker run -d \
  --name pethealth \
  -p 3000:3000 \
  --env-file .env \
  your-dockerhub/pethealth:latest

# Run database migrations
npx prisma migrate deploy
```

---

## Project Structure

```
pethealth/
├── app/
│   ├── api/                    # API Routes (Controllers)
│   │   ├── auth/               # Authentication endpoints
│   │   ├── pets/               # Pet CRUD + nested resources
│   │   │   └── [id]/
│   │   │       ├── vaccines/
│   │   │       ├── weight/
│   │   │       ├── medical/
│   │   │       ├── checklist/
│   │   │       ├── ai-chat/
│   │   │       └── ai-summary/
│   │   ├── upload/             # S3 photo upload
│   │   └── cron/               # Email reminder cron
│   ├── pets/                   # Frontend pages
│   ├── auth/                   # Login / signup pages
│   └── components/             # Shared components
├── lib/
│   ├── auth.ts                 # validateUser, validatePetOwner
│   └── prisma.ts               # Prisma client
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── scripts/
│   └── sendReminders.ts        # Cron job script
└── Dockerfile                  # Multi-stage build
```
