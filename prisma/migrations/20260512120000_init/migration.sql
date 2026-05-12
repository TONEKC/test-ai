-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('ACTIVE', 'REPLACED', 'DELETED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(40),
    "passwordHash" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_registrations" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "referenceCode" VARCHAR(32) NOT NULL,
    "eventName" VARCHAR(180) NOT NULL,
    "attendeeName" VARCHAR(160) NOT NULL,
    "attendeeEmail" VARCHAR(255) NOT NULL,
    "attendeePhone" VARCHAR(40),
    "organization" VARCHAR(180),
    "status" "RegistrationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registration_documents" (
    "id" UUID NOT NULL,
    "registrationId" UUID NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "storageKey" VARCHAR(512) NOT NULL,
    "url" VARCHAR(1024) NOT NULL,
    "mimeType" VARCHAR(120) NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'ACTIVE',
    "replacedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registration_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "event_registrations_referenceCode_key" ON "event_registrations"("referenceCode");

-- CreateIndex
CREATE INDEX "event_registrations_userId_idx" ON "event_registrations"("userId");

-- CreateIndex
CREATE INDEX "event_registrations_referenceCode_idx" ON "event_registrations"("referenceCode");

-- CreateIndex
CREATE INDEX "event_registrations_status_submittedAt_idx" ON "event_registrations"("status", "submittedAt");

-- CreateIndex
CREATE INDEX "event_registrations_attendeeEmail_idx" ON "event_registrations"("attendeeEmail");

-- CreateIndex
CREATE UNIQUE INDEX "registration_documents_storageKey_key" ON "registration_documents"("storageKey");

-- CreateIndex
CREATE INDEX "registration_documents_registrationId_idx" ON "registration_documents"("registrationId");

-- CreateIndex
CREATE INDEX "registration_documents_status_idx" ON "registration_documents"("status");

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration_documents" ADD CONSTRAINT "registration_documents_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "event_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
