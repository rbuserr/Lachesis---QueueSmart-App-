-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "QueueLifecycleStatus" AS ENUM ('open', 'closed');

-- CreateEnum
CREATE TYPE "QueueEntryStatus" AS ENUM ('waiting', 'serving', 'served', 'canceled');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('sent', 'viewed');

-- CreateEnum
CREATE TYPE "QueueOutcome" AS ENUM ('served', 'left', 'cancelled');

-- CreateTable
CREATE TABLE "UserCredential" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "contactInfo" VARCHAR(100),
    "preferences" JSONB,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "expectedDurationMinutes" INTEGER NOT NULL,
    "priority" "Priority" NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Queue" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "status" "QueueLifecycleStatus" NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueueEntry" (
    "id" SERIAL NOT NULL,
    "queueId" INTEGER NOT NULL,
    "userId" TEXT,
    "traderName" VARCHAR(100) NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "priority" "Priority" NOT NULL,
    "position" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "QueueEntryStatus" NOT NULL DEFAULT 'waiting',

    CONSTRAINT "QueueEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "NotificationStatus" NOT NULL DEFAULT 'sent',

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueueHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "traderName" VARCHAR(100) NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "outcome" "QueueOutcome" NOT NULL,

    CONSTRAINT "QueueHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserCredential_email_key" ON "UserCredential"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");

-- CreateIndex
CREATE INDEX "Queue_serviceId_status_idx" ON "Queue"("serviceId", "status");

-- CreateIndex
CREATE INDEX "QueueEntry_queueId_status_idx" ON "QueueEntry"("queueId", "status");

-- CreateIndex
CREATE INDEX "QueueEntry_userId_idx" ON "QueueEntry"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_status_idx" ON "Notification"("userId", "status");

-- CreateIndex
CREATE INDEX "QueueHistory_userId_idx" ON "QueueHistory"("userId");

-- CreateIndex
CREATE INDEX "QueueHistory_serviceId_idx" ON "QueueHistory"("serviceId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserCredential"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueEntry" ADD CONSTRAINT "QueueEntry_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "Queue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueEntry" ADD CONSTRAINT "QueueEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserCredential"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserCredential"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueHistory" ADD CONSTRAINT "QueueHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserCredential"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueHistory" ADD CONSTRAINT "QueueHistory_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
