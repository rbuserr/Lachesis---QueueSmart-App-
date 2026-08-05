# Lachesis — QueueSmart App

Lachesis is a web-based queue management system for proprietary trading firms that enables traders to submit support requests, view real-time queue status, and receive notifications. Administrators prioritize and manage tickets, ensuring efficient routing of high-priority trading issues through automated queue processing and communication.

## Database setup (Prisma + Neon)

We use **PostgreSQL on [Neon](https://neon.tech)** with **Prisma ORM**.

### 1. Get Neon connection strings

1. Create a Neon project (or open the team project).
2. Click **Connect**.
3. Copy the **pooled** connection string (`-pooler` in the host) → `DATABASE_URL`.
4. Copy the **direct** connection string (no `-pooler`) → `DIRECT_URL`.

### 2. Configure env

```bash
cp .env.example .env
```

Paste both URLs into `.env`. Never commit `.env`.

### 3. Install & generate client

```bash
npm install
npm run db:generate
```

### 4. Create tables

Prefer migrations (tracked history for the A4 report):

```bash
npm run db:migrate
# when prompted, name the migration e.g. init
```

Or push schema without a migration file (faster prototyping):

```bash
npm run db:push
```

### 5. Seed baseline data

```bash
npm run db:seed
```

Seeds:

- Admin: `admin@queuesmart.com` / `Admin123` (password **hashed**)
- The three default services + an open `Queue` per service

### Useful scripts

| Script | Purpose |
| --- | --- |
| `npm run db:generate` | Regenerate Prisma Client after schema edits |
| `npm run db:migrate` | Create/apply SQL migrations (`DIRECT_URL`) |
| `npm run db:push` | Push schema without migration files |
| `npm run db:seed` | Seed admin + services |
| `npm run db:studio` | Browse data in Prisma Studio |

### How to use Prisma in server code

```ts
import { prisma } from "@/server/db";
import { hashPassword, verifyPassword } from "@/server/password";

const services = await prisma.service.findMany();
```

Import the client from `@/server/db` only (not a new `PrismaClient()` per file).

Domain models live in `prisma/schema.prisma`. Generated types: `@/generated/prisma`.

### Auth (done)

Login/register persist to Neon (`UserCredential` + `UserProfile`) with bcrypt hashes via `src/server/auth.ts` and `src/server/password.ts`.

Session cookie + `localStorage` identify the logged-in trader (replaces hardcoded `"John D."`). Middleware protects trader/admin pages by role. API routes require a session (admin mutations require `role: admin`). Use **Sign out** in the portal nav to clear the session.

### Team split (remaining)

| Area | Tables | Touch points |
| --- | --- | --- |
| Services | `Service` | `src/server/services.ts` |
| Queue | `Queue`, `QueueEntry` | `src/server/queue.ts` |
| History / notifications | `QueueHistory`, `Notification` | history + notification modules |

Keep using the in-memory `app-store` until your slice is migrated; swap reads/writes to `prisma` one module at a time.
