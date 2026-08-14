import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import { PrismaClient, Priority } from "../src/generated/prisma";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

/** Enough samples for the smart wait estimator (uses last 20 served). */
const HISTORY_PER_SERVICE = 20;

const seedServices: Array<{
  name: string;
  description: string;
  expectedDurationMinutes: number;
  /** Target average minutes in seeded history (differs from expected on purpose). */
  historicalAverageMinutes: number;
  priority: Priority;
}> = [
  {
    name: "General Account Inquiry",
    description: "General questions regarding trader accounts.",
    expectedDurationMinutes: 10,
    historicalAverageMinutes: 6,
    priority: "low",
  },
  {
    name: "Evaluation Phase Verification",
    description: "Review and verify evaluation phase progress.",
    expectedDurationMinutes: 25,
    historicalAverageMinutes: 18,
    priority: "medium",
  },
  {
    name: "Live Trade / Platform Execution Issue",
    description: "Urgent support for live trading platform issues.",
    expectedDurationMinutes: 5,
    historicalAverageMinutes: 8,
    priority: "high",
  },
];

const seedTraders: Array<{
  email: string;
  fullName: string;
  password: string;
}> = [
  {
    email: "trader@queuesmart.com",
    fullName: "Alex Trader",
    password: "Trader123",
  },
  {
    email: "jordan@queuesmart.com",
    fullName: "Jordan Lee",
    password: "Trader123",
  },
  {
    email: "sam@queuesmart.com",
    fullName: "Sam Rivera",
    password: "Trader123",
  },
];

function varianceMinutes(index: number, base: number): number {
  // Spread ±2 minutes around the target average so samples aren't identical.
  const offset = (index % 5) - 2;
  return Math.max(1, base + offset);
}

async function upsertUser(input: {
  email: string;
  fullName: string;
  password: string;
  role: "admin" | "user";
}) {
  const passwordHash = await bcrypt.hash(input.password, 10);

  return prisma.userCredential.upsert({
    where: { email: input.email },
    update: {
      passwordHash,
      role: input.role,
      profile: {
        upsert: {
          create: {
            fullName: input.fullName,
            email: input.email,
          },
          update: {
            fullName: input.fullName,
            email: input.email,
          },
        },
      },
    },
    create: {
      email: input.email,
      passwordHash,
      role: input.role,
      profile: {
        create: {
          fullName: input.fullName,
          email: input.email,
        },
      },
    },
  });
}

async function ensureService(input: {
  name: string;
  description: string;
  expectedDurationMinutes: number;
  priority: Priority;
}) {
  const existing = await prisma.service.findFirst({
    where: { name: input.name },
  });

  const service =
    existing ??
    (await prisma.service.create({
      data: {
        name: input.name,
        description: input.description,
        expectedDurationMinutes: input.expectedDurationMinutes,
        priority: input.priority,
        isOpen: true,
        queues: {
          create: { status: "open" },
        },
      },
    }));

  if (existing) {
    await prisma.service.update({
      where: { id: existing.id },
      data: {
        description: input.description,
        expectedDurationMinutes: input.expectedDurationMinutes,
        priority: input.priority,
        isOpen: true,
      },
    });

    const openQueue = await prisma.queue.findFirst({
      where: { serviceId: existing.id, status: "open" },
    });

    if (!openQueue) {
      await prisma.queue.create({
        data: { serviceId: existing.id, status: "open" },
      });
    }
  }

  return service;
}

async function seedHistoryForService(input: {
  serviceId: number;
  historicalAverageMinutes: number;
  traderIds: string[];
  traderNames: string[];
}) {
  // Replace prior seed history for this service so re-seeding stays idempotent.
  await prisma.queueHistory.deleteMany({
    where: {
      serviceId: input.serviceId,
      traderName: { startsWith: "Seed Trader" },
    },
  });

  const now = Date.now();
  const rows = Array.from({ length: HISTORY_PER_SERVICE }, (_, index) => {
    const durationMinutes = varianceMinutes(
      index,
      input.historicalAverageMinutes,
    );
    const completedAt = new Date(now - index * 60 * 60 * 1000);
    const joinedAt = new Date(
      completedAt.getTime() - durationMinutes * 60 * 1000,
    );
    const traderIndex = index % input.traderIds.length;

    return {
      userId: input.traderIds[traderIndex],
      traderName: `Seed Trader ${String(index + 1).padStart(2, "0")}`,
      serviceId: input.serviceId,
      joinedAt,
      completedAt,
      outcome: "served" as const,
    };
  });

  await prisma.queueHistory.createMany({ data: rows });
}

async function main() {
  const admin = await upsertUser({
    email: "admin@queuesmart.com",
    fullName: "QueueSmart Administrator",
    password: "Admin123",
    role: "admin",
  });

  const traders = [];
  for (const trader of seedTraders) {
    traders.push(
      await upsertUser({
        ...trader,
        role: "user",
      }),
    );
  }

  const traderIds = traders.map((t) => t.id);
  const traderNames = traders.map((t) => t.email);

  for (const service of seedServices) {
    const saved = await ensureService(service);
    await seedHistoryForService({
      serviceId: saved.id,
      historicalAverageMinutes: service.historicalAverageMinutes,
      traderIds,
      traderNames,
    });

    console.log(
      `Service "${saved.name}": expected ${service.expectedDurationMinutes}m → seeded history ~${service.historicalAverageMinutes}m (${HISTORY_PER_SERVICE} served)`,
    );
  }

  console.log("\nSeed complete.");
  console.log(`Admin: admin@queuesmart.com / Admin123 (id: ${admin.id})`);
  console.log("Traders (password Trader123):");
  for (const trader of seedTraders) {
    console.log(`  - ${trader.email} (${trader.fullName})`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
