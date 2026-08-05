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

const seedServices: Array<{
  name: string;
  description: string;
  expectedDurationMinutes: number;
  priority: Priority;
}> = [
  {
    name: "General Account Inquiry",
    description: "General questions regarding trader accounts.",
    expectedDurationMinutes: 10,
    priority: "low",
  },
  {
    name: "Evaluation Phase Verification",
    description: "Review and verify evaluation phase progress.",
    expectedDurationMinutes: 25,
    priority: "medium",
  },
  {
    name: "Live Trade / Platform Execution Issue",
    description: "Urgent support for live trading platform issues.",
    expectedDurationMinutes: 5,
    priority: "high",
  },
];

async function main() {
  const adminEmail = "admin@queuesmart.com";
  const passwordHash = await bcrypt.hash("Admin123", 10);

  const admin = await prisma.userCredential.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      role: "admin",
      profile: {
        create: {
          fullName: "QueueSmart Administrator",
          email: adminEmail,
        },
      },
    },
  });

  for (const service of seedServices) {
    const existing = await prisma.service.findFirst({
      where: { name: service.name },
    });

    const saved =
      existing ??
      (await prisma.service.create({
        data: service,
      }));

    const openQueue = await prisma.queue.findFirst({
      where: { serviceId: saved.id, status: "open" },
    });

    if (!openQueue) {
      await prisma.queue.create({
        data: { serviceId: saved.id, status: "open" },
      });
    }
  }

  console.log(`Seed complete. Admin user id: ${admin.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
