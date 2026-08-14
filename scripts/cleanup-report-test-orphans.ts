import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
});

const TEST_DESCRIPTION = "Created for reports.test.ts";

async function main() {
  const orphans = await prisma.service.findMany({
    where: { description: TEST_DESCRIPTION },
    select: { id: true, name: true },
  });

  if (orphans.length === 0) {
    console.log("No report-test orphan services found.");
    return;
  }

  const ids = orphans.map((s) => s.id);
  console.log(
    `Cleaning ${orphans.length} orphan service(s):`,
    orphans.map((s) => `${s.id}:${s.name}`).join(", "),
  );

  const history = await prisma.queueHistory.deleteMany({
    where: { serviceId: { in: ids } },
  });
  const entries = await prisma.queueEntry.deleteMany({
    where: { serviceId: { in: ids } },
  });
  const queues = await prisma.queue.deleteMany({
    where: { serviceId: { in: ids } },
  });
  const services = await prisma.service.deleteMany({
    where: { id: { in: ids } },
  });

  console.log({
    deletedHistory: history.count,
    deletedEntries: entries.count,
    deletedQueues: queues.count,
    deletedServices: services.count,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
